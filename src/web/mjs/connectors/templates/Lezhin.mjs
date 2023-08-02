import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class Lezhin extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.apiURL = 'https://www.lezhinus.com';
        this.cdnURL = 'https://rcdn.lezhin.com';
        this.token = undefined;
        this.mangasPerPage = 36;
        this.config = {
            username: {
                label: 'E-Mail',
                description: 'E-Mail for login with your Lezhin account.\nAn account is required to access R-rated content.',
                input: 'text',
                value: ''
            },
            password: {
                label: 'Password',
                description: 'Password for login with your Lezhin account.\nAn account is required to access R-rated content.',
                input: 'password',
                value: ''
            },
            forceJPEG: {
                label: 'Force JPEG',
                description: 'Always use JPEG instead of WEBP images, even when WEBP images would be available.\nNote: The WEBP images are smaller in size but still provide the same or even slightly better quality.',
                input: 'checkbox',
                value: true
            }
        };
    }

    async _initializeConnector() {
        const data = await this.getLzConfig();
        this.cdnURL = data.contentsCdnUrl ? data.contentsCdnUrl : this.cdnURL;
    }

    async _initializeAccount() {
        if(this.token) {
            //check if user disconnected
            const data = await this.getLzConfig();
            if (!data.token) {
                this.requestOptions.headers.delete('Authorization');
                this.token = '';
            }
        }

        if(this.token || !this.config.username.value || !this.config.password.value) {
            return;
        }
        const password = this.config.password.value.replace("'", "\\'"); //escape the password, because if it contains a single quote the script will fail
        let script = `
        new Promise((resolve, reject) => {
                if($('#log-nav-email').length) {
                    return resolve();
                }
                const form = $('form#email');
                form.find('input#login-email').val('${this.config.username.value}');
                form.find('input#login-password').val('${password}');
                $.ajax({
                    type: 'POST',
                    url: form.prop('action'),
                    data: form.serialize(),
                    success: resolve,
                    error: reject
                });
        });
        `;
        let request = new Request(new URL(this.url + '/login'), this.requestOptions);
        await Engine.Request.fetchUI(request, script);

        const data = await this.getLzConfig();
        this.token = data.token;
        this.requestOptions.headers.set('Authorization', 'Bearer '+ data.token);

        // force user locale user setting to be the same as locale from the currently used website ...
        // => prevent a warning webpage that would appear otherwise when loading chapters / pages
        return fetch(this.url + '/locale/' + this.locale, this.requestOptions);
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.comicInfo__detail h2.comicInfo__title');
        let id = uri.pathname.match(/comic\/([^/]+)/)[1];
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 0, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/lz-api/v2/comics', this.apiURL);
        uri.searchParams.set('menu', 'general');
        uri.searchParams.set('limit', this.mangasPerPage);
        uri.searchParams.set('offset', page * this.mangasPerPage);
        uri.searchParams.set('order', 'popular');
        uri.searchParams.set('adult_kind', 'all');

        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data.map( manga => {
            return {
                id: manga.alias, // manga.id
                title: manga.title
            };
        });
    }

    async _getChapters(manga) {
        await this._initializeAccount();
        let script = `
        new Promise((resolve, reject) => {
            // wait until episodes have been updated with purchase info ...
            setTimeout(() => {
                    let chapters = __LZ_PRODUCT__.all // __LZ_PRODUCT__.product.episodes
                    .filter(chapter => {
                        if(chapter.purchased) {
                            return true;
                        }
                        if(chapter.coin === 0) {
                            return true;
                        }
                        if(chapter.freedAt && chapter.freedAt < Date.now()) {
                            return true;
                        }
                        if(chapter.prefree && chapter.prefree.closeTimer && chapter.prefree.closeTimer.expiredAt > Date.now()) {
                            return true;
                        }
                        return false;
                    })
                    .map(chapter => {
                        return {
                            id: chapter.name, // chapter.id,
                            title: chapter.display.displayName + ' - ' + chapter.display.title,
                            language: '${this.locale}'
                        };
                    });
                    resolve(chapters);
            }, 2500);
        });
        `;
        let request = new Request(new URL('/comic/' + manga.id, this.url), this.requestOptions);
        return await Engine.Request.fetchUI(request, script);
    }

    async _getPages(chapter) {
        await this._initializeAccount();

        //check if chapter is purchased
        let script = `
        new Promise((resolve, reject) => {
            // wait until episodes have been updated with purchase info ...
            setTimeout(() => {
                    let chapter = __LZ_PRODUCT__.all.filter(chapter => chapter.name == "${chapter.id}");
                    resolve(chapter[0].purchased);
            }, 2500);
        });
        `;
        let request = new Request(new URL('/comic/' + chapter.manga.id, this.url), this.requestOptions);
        const purchased = await Engine.Request.fetchUI(request, script);

        let uri = new URL('https://www.lezhin.com/lz-api/v2/inventory_groups/comic_viewer');
        uri.searchParams.set('platform', 'web');
        uri.searchParams.set('store', 'web');
        uri.searchParams.set('alias', chapter.manga.id);
        uri.searchParams.set('name', chapter.id);
        uri.searchParams.set('preload', false);
        uri.searchParams.set('type', 'comic_episode');
        request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);

        return data.data.extra.episode.scrollsInfo.map(scroll => {
            return this.createConnectorURI({url : scroll.path, infos : JSON.stringify(data), purchased : purchased});
        });
    }

    async _handleConnectorURI(payload) {
        /*
        q  | Free  | Purchased
        ----------------------
        10 |  480w |  640w
        20 |  640w |  720w
        30 |  720w | 1080w
        40 | 1080w | 1280w
        */

        let data = JSON.parse(payload.infos);
        const episode = data.data.extra.episode;
        const extension = this.config.forceJPEG.value ? '.jpg' : '.webp';
        let imageurl = new URL('/v2' + payload.url + extension, this.cdnURL);
        let purchased = payload.purchased ? payload.purchased : false;
        //purchased = purchased || (episode.freedAt && episode.freedAt < Date.now());
        const subscribed = data.data.extra.subscribed;
        const updatedAt = episode.updatedAt;

        let tokenuri = new URL('/lz-api/v2/cloudfront/signed-url/generate', this.apiURL);
        tokenuri.searchParams.set('contentId', episode.idComic);
        tokenuri.searchParams.set('episodeId', episode.id);
        tokenuri.searchParams.set('purchased', subscribed || purchased);
        tokenuri.searchParams.set('q', 40);
        tokenuri.searchParams.set('firstCheckType', 'P');

        //get parameters
        let request = new Request( tokenuri, this.requestOptions );
        request.headers.set('x-referer', this.apiURL);
        let response = await this.fetchJSON(request);

        //update image url
        imageurl.searchParams.set('purchased', subscribed || purchased);
        imageurl.searchParams.set('q', 40);
        imageurl.searchParams.set('updated', updatedAt);
        imageurl.searchParams.set('Policy', response.data.Policy);
        imageurl.searchParams.set('Signature', response.data.Signature);
        imageurl.searchParams.set('Key-Pair-Id', response.data['Key-Pair-Id']);
        request = new Request(imageurl, this.requestOptions);
        response = await fetch(request);

        const scrambled = data.data.extra.comic.metadata?.imageShuffle;
        data = await response.blob();
        if (scrambled) {//if image is scrambled
            data = await this.descrambleimage(data, episode.id);
        }
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }

    async getLzConfig() {
        const uri = new URL(this.url);
        const checkscript = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                        resolve(__LZ_CONFIG__);
                },2500);
            });
            `;
        const request = new Request(uri, this.requestOptions);
        return await Engine.Request.fetchUI(request, checkscript);
    }

    async descrambleimage(imageBlob, episodeid) {
        const bitmap = await createImageBitmap(imageBlob);
        return new Promise(resolve => {

            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width,
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('2d');
            let scrambleTable = _generateScrambletable(episodeid, 5);
            const i = Math.floor(Math.sqrt(scrambleTable.length));
            const dimensions = {width : canvas.width, height : canvas.height};

            scrambleTable = _addLength(scrambleTable);
            scrambleTable = createSuperArray(scrambleTable);

            const piecesData = scrambleTable.map(entry => {
                const n = entry[0];
                const r = entry[1];
                return {
                    from: calculatePieces(dimensions, i, parseInt(n)),
                    to: calculatePieces(dimensions, i, r)
                };
            }).filter(entry => {
                return !!entry.from && !!entry.to;
            });

            for (const piece of piecesData) {
                const e = piece.from;
                const n = piece.to;
                ctx.drawImage(bitmap, n.left, n.top, n.width, n.height, e.left, e.top, e.width, e.height );
            }

            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat( Engine.Settings.recompressionQuality.value )/100);
        });

    }
}

//*************************
// LEHZIN SCRAMBLING
//************************

function _generateScrambletable(episodeid, e) {
    return episodeid ? new Randomizer(episodeid, e).get() : [];
}

const Randomizer = function e(t, n) {
    var r = this;
    !function (t) {
        if (!(t instanceof e)) throw new TypeError('Cannot call a class as a function');
    }(this),

    this.random = function (t) {
        var e = r.state;
        return e = (
            e = (e = e.xor(e.shiftRight(bigInt(12)))).xor(e.shiftLeft(bigInt(25)).and(bigInt('18446744073709551615')))
        ).xor(e.shiftRight(bigInt(27))),
        r.state = e.and(bigInt('18446744073709551615')),
        e.shiftRight(bigInt(32)).remainder(bigInt(t)).toJSNumber();
    },

    this.get = function () {
        return r.order;
    },

    this.seed = t,
    this.state = bigInt(this.seed);
    for (
        var i = n * n,
            o = Array.from({
                length: i
            }, function (t, e) {
                return e;
            }),
            a = 0;
        a < o.length;
        a++
    ) {
        var s = this.random(i),
            u = o[a];
        o[a] = o[s],
        o[s] = u;
    }
    this.order = o;
};

function _addLength(t) {
    return [].concat(t, [
        t.length,
        t.length + 1
    ]);
}

function createSuperArray(array) {
    //generate "0", "arraylength" array
    const indexArray = Array(array.length).fill().map((_, index) => index.toString());
    const resultArray = [];
    indexArray.map(element => resultArray.push([element, array[element]]));
    return resultArray;
}

function calculatePieces(t, e, n) {
    var r,
        i,
        o,
        a,
        s,
        u,
        c,
        l,
        f,
        h,
        d,
        p,
        v,
        g,
        m,
        y,
        b,
        w = e * e;
    return n < w ? (
        p = e,
        v = n,
        g = (d = t).width,
        m = d.height,
        y = Math.floor(g / p),
        b = Math.floor(m / p),
        {
            left: v % p * y,
            top: Math.floor(v / p) * b,
            width: y,
            height: b
        }
    ) : n === w ? (
        c = e,
        l = (u = t).width,
        f = u.height,
        0 === (h = l % c) ? null : {
            left: l - h,
            top: 0,
            width: h,
            height: f
        }
    ) : (
        i = e,
        o = (r = t).width,
        a = r.height,
        0 === (s = a % i) ? null : {
            left: 0,
            top: a - s,
            width: o - o % i,
            height: s
        }
    );
}

const bigInt=function(t) {
    "use strict"; var e=1e7, r=9007199254740992, o=f(r), n="0123456789abcdefghijklmnopqrstuvwxyz", i="function"==typeof BigInt; function u(t, e, r, o) {
        return void 0===t?u[0]:void 0!==e&&(10!=+e||r)?_(t, e, r, o):K(t);
    }function p(t, e) {
        this.value=t, this.sign=e, this.isSmall=!1;
    }function a(t) {
        this.value=t, this.sign=t<0, this.isSmall=!0;
    }function s(t) {
        this.value=t;
    }function l(t) {
        return-r<t&&t<r;
    }function f(t) {
        return t<1e7?[t]:t<1e14?[t%1e7, Math.floor(t/1e7)]:[t%1e7, Math.floor(t/1e7)%1e7, Math.floor(t/1e14)];
    }function v(t) {
        h(t); var r=t.length; if(r<4&&A(t, o)<0)switch(r) {
            case 0:return 0; case 1:return t[0]; case 2:return t[0]+t[1]*e; default:return t[0]+(t[1]+t[2]*e)*e;
        }return t;
    }function h(t) {
        for(var e=t.length; 0===t[--e];);t.length=e+1;
    }function y(t) {
        for(var e=new Array(t), r=-1; ++r<t;)e[r]=0; return e;
    }function g(t) {
        return t>0?Math.floor(t):Math.ceil(t);
    }function c(t, r) {
        var o, n, i=t.length, u=r.length, p=new Array(i), a=0, s=e; for(n=0; n<u; n++)a=(o=t[n]+r[n]+a)>=s?1:0, p[n]=o-a*s; for(;n<i;)a=(o=t[n]+a)===s?1:0, p[n++]=o-a*s; return a>0&&p.push(a), p;
    }function m(t, e) {
        return t.length>=e.length?c(t, e):c(e, t);
    }function d(t, r) {
        var o, n, i=t.length, u=new Array(i), p=e; for(n=0; n<i; n++)o=t[n]-p+r, r=Math.floor(o/p), u[n]=o-r*p, r+=1; for(;r>0;)u[n++]=r%p, r=Math.floor(r/p); return u;
    }function b(t, r) {
        var o, n, i=t.length, u=r.length, p=new Array(i), a=0, s=e; for(o=0; o<u; o++)(n=t[o]-a-r[o])<0?(n+=s, a=1):a=0, p[o]=n; for(o=u; o<i; o++) {
            if(!((n=t[o]-a)<0)) {
                p[o++]=n; break;
            }n+=s, p[o]=n;
        }for(;o<i; o++)p[o]=t[o]; return h(p), p;
    }function w(t, r, o) {
        var n, i, u=t.length, s=new Array(u), l=-r, f=e; for(n=0; n<u; n++)i=t[n]+l, l=Math.floor(i/f), i%=f, s[n]=i<0?i+f:i; return"number"==typeof(s=v(s))?(o&&(s=-s), new a(s)):new p(s, o);
    }function S(t, r) {
        var o, n, i, u, p=t.length, a=r.length, s=y(p+a), l=e; for(i=0; i<p; ++i) {
            u=t[i]; for(var f=0; f<a; ++f)o=u*r[f]+s[i+f], n=Math.floor(o/l), s[i+f]=o-n*l, s[i+f+1]+=n;
        }return h(s), s;
    }function I(t, r) {
        var o, n, i=t.length, u=new Array(i), p=e, a=0; for(n=0; n<i; n++)o=t[n]*r+a, a=Math.floor(o/p), u[n]=o-a*p; for(;a>0;)u[n++]=a%p, a=Math.floor(a/p); return u;
    }function q(t, e) {
        for(var r=[]; e-- >0;)r.push(0); return r.concat(t);
    }function M(t, e) {
        var r=Math.max(t.length, e.length); if(r<=30)return S(t, e); r=Math.ceil(r/2); var o=t.slice(r), n=t.slice(0, r), i=e.slice(r), u=e.slice(0, r), p=M(n, u), a=M(o, i), s=M(m(n, o), m(u, i)), l=m(m(p, q(b(b(s, p), a), r)), q(a, 2*r)); return h(l), l;
    }function N(t, r, o) {
        return new p(t<e?I(r, t):S(r, f(t)), o);
    }function E(t) {
        var r, o, n, i, u=t.length, p=y(u+u), a=e; for(n=0; n<u; n++) {
            o=0-(i=t[n])*i; for(var s=n; s<u; s++)r=i*t[s]*2+p[n+s]+o, o=Math.floor(r/a), p[n+s]=r-o*a; p[n+u]=o;
        }return h(p), p;
    }function O(t, e) {
        var r, o, n, i, u=t.length, p=y(u); for(n=0, r=u-1; r>=0; --r)n=(i=1e7*n+t[r])-(o=g(i/e))*e, p[r]=0|o; return[p, 0|n];
    }function B(t, r) {
        var o, n=K(r); if(i)return[new s(t.value/n.value), new s(t.value%n.value)]; var l, c=t.value, m=n.value; if(0===m)throw new Error("Cannot divide by zero"); if(t.isSmall)return n.isSmall?[new a(g(c/m)), new a(c%m)]:[u[0], t]; if(n.isSmall) {
            if(1===m)return[t, u[0]]; if(-1==m)return[t.negate(), u[0]]; var d=Math.abs(m); if(d<e) {
                l=v((o=O(c, d))[0]); var w=o[1]; return t.sign&&(w=-w), "number"==typeof l?(t.sign!==n.sign&&(l=-l), [new a(l), new a(w)]):[new p(l, t.sign!==n.sign), new a(w)];
            }m=f(d);
        }var S=A(c, m); if(-1===S)return[u[0], t]; if(0===S)return[u[t.sign===n.sign?1:-1], u[0]]; o=c.length+m.length<=200?function(t, r) {
            var o, n, i, u, p, a, s, l=t.length, f=r.length, h=e, g=y(r.length), c=r[f-1], m=Math.ceil(h/(2*c)), d=I(t, m), b=I(r, m); for(d.length<=l&&d.push(0), b.push(0), c=b[f-1], n=l-f; n>=0; n--) {
                for(o=h-1, d[n+f]!==c&&(o=Math.floor((d[n+f]*h+d[n+f-1])/c)), i=0, u=0, a=b.length, p=0; p<a; p++)i+=o*b[p], s=Math.floor(i/h), u+=d[n+p]-(i-s*h), i=s, u<0?(d[n+p]=u+h, u=-1):(d[n+p]=u, u=0); for(;0!==u;) {
                    for(o-=1, i=0, p=0; p<a; p++)(i+=d[n+p]-h+b[p])<0?(d[n+p]=i+h, i=0):(d[n+p]=i, i=1); u+=i;
                }g[n]=o;
            }return d=O(d, m)[0], [v(g), v(d)];
        }(c, m):function(t, r) {
            for(var o, n, i, u, p, a=t.length, s=r.length, l=[], f=[], y=e; a;)if(f.unshift(t[--a]), h(f), A(f, r)<0)l.push(0); else{
                i=f[(n=f.length)-1]*y+f[n-2], u=r[s-1]*y+r[s-2], n>s&&(i=(i+1)*y), o=Math.ceil(i/u); do{
                    if(A(p=I(r, o), f)<=0)break; o--;
                }while(o); l.push(o), f=b(f, p);
            }return l.reverse(), [v(l), v(f)];
        }(c, m), l=o[0]; var q=t.sign!==n.sign, M=o[1], N=t.sign; return"number"==typeof l?(q&&(l=-l), l=new a(l)):l=new p(l, q), "number"==typeof M?(N&&(M=-M), M=new a(M)):M=new p(M, N), [l, M];
    }function A(t, e) {
        if(t.length!==e.length)return t.length>e.length?1:-1; for(var r=t.length-1; r>=0; r--)if(t[r]!==e[r])return t[r]>e[r]?1:-1; return 0;
    }function P(t) {
        var e=t.abs(); return!e.isUnit()&&(!!(e.equals(2)||e.equals(3)||e.equals(5))||!(e.isEven()||e.isDivisibleBy(3)||e.isDivisibleBy(5))&&(!!e.lesser(49)||void 0));
    }function Z(t, e) {
        for(var r, o, n, i=t.prev(), u=i, p=0; u.isEven();)u=u.divide(2), p++; t:for(o=0; o<e.length; o++)if(!t.lesser(e[o])&&!(n=bigInt(e[o]).modPow(u, t)).isUnit()&&!n.equals(i)) {
            for(r=p-1; 0!=r; r--) {
                if((n=n.square().mod(t)).isUnit())return!1; if(n.equals(i))continue t;
            }return!1;
        }return!0;
    }p.prototype=Object.create(u.prototype), a.prototype=Object.create(u.prototype), s.prototype=Object.create(u.prototype), p.prototype.add=function(t) {
        var e=K(t); if(this.sign!==e.sign)return this.subtract(e.negate()); var r=this.value, o=e.value; return e.isSmall?new p(d(r, Math.abs(o)), this.sign):new p(m(r, o), this.sign);
    }, p.prototype.plus=p.prototype.add, a.prototype.add=function(t) {
        var e=K(t), r=this.value; if(r<0!==e.sign)return this.subtract(e.negate()); var o=e.value; if(e.isSmall) {
            if(l(r+o))return new a(r+o); o=f(Math.abs(o));
        }return new p(d(o, Math.abs(r)), r<0);
    }, a.prototype.plus=a.prototype.add, s.prototype.add=function(t) {
        return new s(this.value+K(t).value);
    }, s.prototype.plus=s.prototype.add, p.prototype.subtract=function(t) {
        var e=K(t); if(this.sign!==e.sign)return this.add(e.negate()); var r=this.value, o=e.value; return e.isSmall?w(r, Math.abs(o), this.sign):function(t, e, r) {
            var o; return A(t, e)>=0?o=b(t, e):(o=b(e, t), r=!r), "number"==typeof(o=v(o))?(r&&(o=-o), new a(o)):new p(o, r);
        }(r, o, this.sign);
    }, p.prototype.minus=p.prototype.subtract, a.prototype.subtract=function(t) {
        var e=K(t), r=this.value; if(r<0!==e.sign)return this.add(e.negate()); var o=e.value; return e.isSmall?new a(r-o):w(o, Math.abs(r), r>=0);
    }, a.prototype.minus=a.prototype.subtract, s.prototype.subtract=function(t) {
        return new s(this.value-K(t).value);
    }, s.prototype.minus=s.prototype.subtract, p.prototype.negate=function() {
        return new p(this.value, !this.sign);
    }, a.prototype.negate=function() {
        var t=this.sign, e=new a(-this.value); return e.sign=!t, e;
    }, s.prototype.negate=function() {
        return new s(-this.value);
    }, p.prototype.abs=function() {
        return new p(this.value, !1);
    }, a.prototype.abs=function() {
        return new a(Math.abs(this.value));
    }, s.prototype.abs=function() {
        return new s(this.value>=0?this.value:-this.value);
    }, p.prototype.multiply=function(t) {
        var r, o, n, i=K(t), a=this.value, s=i.value, l=this.sign!==i.sign; if(i.isSmall) {
            if(0===s)return u[0]; if(1===s)return this; if(-1===s)return this.negate(); if((r=Math.abs(s))<e)return new p(I(a, r), l); s=f(r);
        }return o=a.length, n=s.length, new p(-.012*o-.012*n+15e-6*o*n>0?M(a, s):S(a, s), l);
    }, p.prototype.times=p.prototype.multiply, a.prototype._multiplyBySmall=function(t) {
        return l(t.value*this.value)?new a(t.value*this.value):N(Math.abs(t.value), f(Math.abs(this.value)), this.sign!==t.sign);
    }, p.prototype._multiplyBySmall=function(t) {
        return 0===t.value?u[0]:1===t.value?this:-1===t.value?this.negate():N(Math.abs(t.value), this.value, this.sign!==t.sign);
    }, a.prototype.multiply=function(t) {
        return K(t)._multiplyBySmall(this);
    }, a.prototype.times=a.prototype.multiply, s.prototype.multiply=function(t) {
        return new s(this.value*K(t).value);
    }, s.prototype.times=s.prototype.multiply, p.prototype.square=function() {
        return new p(E(this.value), !1);
    }, a.prototype.square=function() {
        var t=this.value*this.value; return l(t)?new a(t):new p(E(f(Math.abs(this.value))), !1);
    }, s.prototype.square=function() {
        return new s(this.value*this.value);
    }, p.prototype.divmod=function(t) {
        var e=B(this, t); return{quotient:e[0], remainder:e[1]};
    }, s.prototype.divmod=a.prototype.divmod=p.prototype.divmod, p.prototype.divide=function(t) {
        return B(this, t)[0];
    }, s.prototype.over=s.prototype.divide=function(t) {
        return new s(this.value/K(t).value);
    }, a.prototype.over=a.prototype.divide=p.prototype.over=p.prototype.divide, p.prototype.mod=function(t) {
        return B(this, t)[1];
    }, s.prototype.mod=s.prototype.remainder=function(t) {
        return new s(this.value%K(t).value);
    }, a.prototype.remainder=a.prototype.mod=p.prototype.remainder=p.prototype.mod, p.prototype.pow=function(t) {
        var e, r, o, n=K(t), i=this.value, p=n.value; if(0===p)return u[1]; if(0===i)return u[0]; if(1===i)return u[1]; if(-1===i)return n.isEven()?u[1]:u[-1]; if(n.sign)return u[0]; if(!n.isSmall)throw new Error("The exponent "+n.toString()+" is too large."); if(this.isSmall&&l(e=Math.pow(i, p)))return new a(g(e)); for(r=this, o=u[1]; !0&p&&(o=o.times(r), --p), 0!==p;)p/=2, r=r.square(); return o;
    }, a.prototype.pow=p.prototype.pow, s.prototype.pow=function(t) {
        var e=K(t), r=this.value, o=e.value, n=BigInt(0), i=BigInt(1), p=BigInt(2); if(o===n)return u[1]; if(r===n)return u[0]; if(r===i)return u[1]; if(r===BigInt(-1))return e.isEven()?u[1]:u[-1]; if(e.isNegative())return new s(n); for(var a=this, l=u[1]; (o&i)===i&&(l=l.times(a), --o), o!==n;)o/=p, a=a.square(); return l;
    }, p.prototype.modPow=function(t, e) {
        if(t=K(t), (e=K(e)).isZero())throw new Error("Cannot take modPow with modulus 0"); var r=u[1], o=this.mod(e); for(t.isNegative()&&(t=t.multiply(u[-1]), o=o.modInv(e)); t.isPositive();) {
            if(o.isZero())return u[0]; t.isOdd()&&(r=r.multiply(o).mod(e)), t=t.divide(2), o=o.square().mod(e);
        }return r;
    }, s.prototype.modPow=a.prototype.modPow=p.prototype.modPow, p.prototype.compareAbs=function(t) {
        var e=K(t), r=this.value, o=e.value; return e.isSmall?1:A(r, o);
    }, a.prototype.compareAbs=function(t) {
        var e=K(t), r=Math.abs(this.value), o=e.value; return e.isSmall?r===(o=Math.abs(o))?0:r>o?1:-1:-1;
    }, s.prototype.compareAbs=function(t) {
        var e=this.value, r=K(t).value; return(e=e>=0?e:-e)===(r=r>=0?r:-r)?0:e>r?1:-1;
    }, p.prototype.compare=function(t) {
        if(t===1/0)return-1; if(t===-1/0)return 1; var e=K(t), r=this.value, o=e.value; return this.sign!==e.sign?e.sign?1:-1:e.isSmall?this.sign?-1:1:A(r, o)*(this.sign?-1:1);
    }, p.prototype.compareTo=p.prototype.compare, a.prototype.compare=function(t) {
        if(t===1/0)return-1; if(t===-1/0)return 1; var e=K(t), r=this.value, o=e.value; return e.isSmall?r==o?0:r>o?1:-1:r<0!==e.sign?r<0?-1:1:r<0?1:-1;
    }, a.prototype.compareTo=a.prototype.compare, s.prototype.compare=function(t) {
        if(t===1/0)return-1; if(t===-1/0)return 1; var e=this.value, r=K(t).value; return e===r?0:e>r?1:-1;
    }, s.prototype.compareTo=s.prototype.compare, p.prototype.equals=function(t) {
        return 0===this.compare(t);
    }, s.prototype.eq=s.prototype.equals=a.prototype.eq=a.prototype.equals=p.prototype.eq=p.prototype.equals, p.prototype.notEquals=function(t) {
        return 0!==this.compare(t);
    }, s.prototype.neq=s.prototype.notEquals=a.prototype.neq=a.prototype.notEquals=p.prototype.neq=p.prototype.notEquals, p.prototype.greater=function(t) {
        return this.compare(t)>0;
    }, s.prototype.gt=s.prototype.greater=a.prototype.gt=a.prototype.greater=p.prototype.gt=p.prototype.greater, p.prototype.lesser=function(t) {
        return this.compare(t)<0;
    }, s.prototype.lt=s.prototype.lesser=a.prototype.lt=a.prototype.lesser=p.prototype.lt=p.prototype.lesser, p.prototype.greaterOrEquals=function(t) {
        return this.compare(t)>=0;
    }, s.prototype.geq=s.prototype.greaterOrEquals=a.prototype.geq=a.prototype.greaterOrEquals=p.prototype.geq=p.prototype.greaterOrEquals, p.prototype.lesserOrEquals=function(t) {
        return this.compare(t)<=0;
    }, s.prototype.leq=s.prototype.lesserOrEquals=a.prototype.leq=a.prototype.lesserOrEquals=p.prototype.leq=p.prototype.lesserOrEquals, p.prototype.isEven=function() {
        return 0==(1&this.value[0]);
    }, a.prototype.isEven=function() {
        return 0==(1&this.value);
    }, s.prototype.isEven=function() {
        return(this.value&BigInt(1))===BigInt(0);
    }, p.prototype.isOdd=function() {
        return 1==(1&this.value[0]);
    }, a.prototype.isOdd=function() {
        return 1==(1&this.value);
    }, s.prototype.isOdd=function() {
        return(this.value&BigInt(1))===BigInt(1);
    }, p.prototype.isPositive=function() {
        return!this.sign;
    }, a.prototype.isPositive=function() {
        return this.value>0;
    }, s.prototype.isPositive=a.prototype.isPositive, p.prototype.isNegative=function() {
        return this.sign;
    }, a.prototype.isNegative=function() {
        return this.value<0;
    }, s.prototype.isNegative=a.prototype.isNegative, p.prototype.isUnit=function() {
        return!1;
    }, a.prototype.isUnit=function() {
        return 1===Math.abs(this.value);
    }, s.prototype.isUnit=function() {
        return this.abs().value===BigInt(1);
    }, p.prototype.isZero=function() {
        return!1;
    }, a.prototype.isZero=function() {
        return 0===this.value;
    }, s.prototype.isZero=function() {
        return this.value===BigInt(0);
    }, p.prototype.isDivisibleBy=function(t) {
        var e=K(t); return!e.isZero()&&(!!e.isUnit()||(0===e.compareAbs(2)?this.isEven():this.mod(e).isZero()));
    }, s.prototype.isDivisibleBy=a.prototype.isDivisibleBy=p.prototype.isDivisibleBy, p.prototype.isPrime=function(e) {
        var r=P(this); if(r!==t)return r; var o=this.abs(), n=o.bitLength(); if(n<=64)return Z(o, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]); for(var i=Math.log(2)*n.toJSNumber(), u=Math.ceil(!0===e?2*Math.pow(i, 2):i), p=[], a=0; a<u; a++)p.push(bigInt(a+2)); return Z(o, p);
    }, s.prototype.isPrime=a.prototype.isPrime=p.prototype.isPrime, p.prototype.isProbablePrime=function(e, r) {
        var o=P(this); if(o!==t)return o; for(var n=this.abs(), i=e===t?5:e, u=[], p=0; p<i; p++)u.push(bigInt.randBetween(2, n.minus(2), r)); return Z(n, u);
    }, s.prototype.isProbablePrime=a.prototype.isProbablePrime=p.prototype.isProbablePrime, p.prototype.modInv=function(t) {
        for(var e, r, o, n=bigInt.zero, i=bigInt.one, u=K(t), p=this.abs(); !p.isZero();)e=u.divide(p), r=n, o=u, n=i, u=p, i=r.subtract(e.multiply(i)), p=o.subtract(e.multiply(p)); if(!u.isUnit())throw new Error(this.toString()+" and "+t.toString()+" are not co-prime"); return-1===n.compare(0)&&(n=n.add(t)), this.isNegative()?n.negate():n;
    }, s.prototype.modInv=a.prototype.modInv=p.prototype.modInv, p.prototype.next=function() {
        var t=this.value; return this.sign?w(t, 1, this.sign):new p(d(t, 1), this.sign);
    }, a.prototype.next=function() {
        var t=this.value; return t+1<r?new a(t+1):new p(o, !1);
    }, s.prototype.next=function() {
        return new s(this.value+BigInt(1));
    }, p.prototype.prev=function() {
        var t=this.value; return this.sign?new p(d(t, 1), !0):w(t, 1, this.sign);
    }, a.prototype.prev=function() {
        var t=this.value; return t-1>-r?new a(t-1):new p(o, !0);
    }, s.prototype.prev=function() {
        return new s(this.value-BigInt(1));
    }; for(var x=[1]; 2*x[x.length-1]<=e;)x.push(2*x[x.length-1]); var J=x.length, L=x[J-1]; function U(t) {
        return Math.abs(t)<=e;
    }function T(t, e, r) {
        e=K(e); for(var o=t.isNegative(), n=e.isNegative(), i=o?t.not():t, u=n?e.not():e, p=0, a=0, s=null, l=null, f=[]; !i.isZero()||!u.isZero();)p=(s=B(i, L))[1].toJSNumber(), o&&(p=L-1-p), a=(l=B(u, L))[1].toJSNumber(), n&&(a=L-1-a), i=s[0], u=l[0], f.push(r(p, a)); for(var v=0!==r(o?1:0, n?1:0)?bigInt(-1):bigInt(0), h=f.length-1; h>=0; h-=1)v=v.multiply(L).add(bigInt(f[h])); return v;
    }p.prototype.shiftLeft=function(t) {
        var e=K(t).toJSNumber(); if(!U(e))throw new Error(String(e)+" is too large for shifting."); if(e<0)return this.shiftRight(-e); var r=this; if(r.isZero())return r; for(;e>=J;)r=r.multiply(L), e-=J-1; return r.multiply(x[e]);
    }, s.prototype.shiftLeft=a.prototype.shiftLeft=p.prototype.shiftLeft, p.prototype.shiftRight=function(t) {
        var e, r=K(t).toJSNumber(); if(!U(r))throw new Error(String(r)+" is too large for shifting."); if(r<0)return this.shiftLeft(-r); for(var o=this; r>=J;) {
            if(o.isZero()||o.isNegative()&&o.isUnit())return o; o=(e=B(o, L))[1].isNegative()?e[0].prev():e[0], r-=J-1;
        }return(e=B(o, x[r]))[1].isNegative()?e[0].prev():e[0];
    }, s.prototype.shiftRight=a.prototype.shiftRight=p.prototype.shiftRight, p.prototype.not=function() {
        return this.negate().prev();
    }, s.prototype.not=a.prototype.not=p.prototype.not, p.prototype.and=function(t) {
        return T(this, t, function(t, e) {
            return t&e;
        });
    }, s.prototype.and=a.prototype.and=p.prototype.and, p.prototype.or=function(t) {
        return T(this, t, function(t, e) {
            return t|e;
        });
    }, s.prototype.or=a.prototype.or=p.prototype.or, p.prototype.xor=function(t) {
        return T(this, t, function(t, e) {
            return t^e;
        });
    }, s.prototype.xor=a.prototype.xor=p.prototype.xor; var j=1<<30; function C(t) {
        var r=t.value, o="number"==typeof r?r|j:"bigint"==typeof r?r|BigInt(j):r[0]+r[1]*e|1073758208; return o&-o;
    }function D(t, e) {
        if(e.compareTo(t)<=0) {
            var r=D(t, e.square(e)), o=r.p, n=r.e, i=o.multiply(e); return i.compareTo(t)<=0?{p:i, e:2*n+1}:{p:o, e:2*n};
        }return{p:bigInt(1), e:0};
    }function z(t, e) {
        return t=K(t), e=K(e), t.greater(e)?t:e;
    }function R(t, e) {
        return t=K(t), e=K(e), t.lesser(e)?t:e;
    }function k(t, e) {
        if(t=K(t).abs(), e=K(e).abs(), t.equals(e))return t; if(t.isZero())return e; if(e.isZero())return t; for(var r, o, n=u[1]; t.isEven()&&e.isEven();)r=R(C(t), C(e)), t=t.divide(r), e=e.divide(r), n=n.multiply(r); for(;t.isEven();)t=t.divide(C(t)); do{
            for(;e.isEven();)e=e.divide(C(e)); t.greater(e)&&(o=e, e=t, t=o), e=e.subtract(t);
        }while(!e.isZero()); return n.isUnit()?t:t.multiply(n);
    }p.prototype.bitLength=function() {
        var t=this; return t.compareTo(bigInt(0))<0&&(t=t.negate().subtract(bigInt(1))), 0===t.compareTo(bigInt(0))?bigInt(0):bigInt(D(t, bigInt(2)).e).add(bigInt(1));
    }, s.prototype.bitLength=a.prototype.bitLength=p.prototype.bitLength; var _=function(t, e, r, o) {
        r=r||n, t=String(t), o||(t=t.toLowerCase(), r=r.toLowerCase()); var i, u=t.length, p=Math.abs(e), a={}; for(i=0; i<r.length; i++)a[r[i]]=i; for(i=0; i<u; i++) {
            if("-"!==(f=t[i])&&(f in a&&a[f]>=p)) {
                if("1"===f&&1===p)continue; throw new Error(f+" is not a valid digit in base "+e+".");
            }
        }e=K(e); var s=[], l="-"===t[0]; for(i=l?1:0; i<t.length; i++) {
            var f; if((f=t[i])in a)s.push(K(a[f])); else{
                if("<"!==f)throw new Error(f+" is not a valid character"); var v=i; do{
                    i++;
                }while(">"!==t[i]&&i<t.length); s.push(K(t.slice(v+1, i)));
            }
        }return $(s, e, l);
    }; function $(t, e, r) {
        var o, n=u[0], i=u[1]; for(o=t.length-1; o>=0; o--)n=n.add(t[o].times(i)), i=i.times(e); return r?n.negate():n;
    }function F(t, e) {
        if((e=bigInt(e)).isZero()) {
            if(t.isZero())return{value:[0], isNegative:!1}; throw new Error("Cannot convert nonzero numbers to base 0.");
        }if(e.equals(-1)) {
            if(t.isZero())return{value:[0], isNegative:!1}; if(t.isNegative())return{value:[].concat.apply([], Array.apply(null, Array(-t.toJSNumber())).map(Array.prototype.valueOf, [1, 0])), isNegative:!1}; var r=Array.apply(null, Array(t.toJSNumber()-1)).map(Array.prototype.valueOf, [0, 1]); return r.unshift([1]), {value:[].concat.apply([], r), isNegative:!1};
        }var o=!1; if(t.isNegative()&&e.isPositive()&&(o=!0, t=t.abs()), e.isUnit())return t.isZero()?{value:[0], isNegative:!1}:{value:Array.apply(null, Array(t.toJSNumber())).map(Number.prototype.valueOf, 1), isNegative:o}; for(var n, i=[], u=t; u.isNegative()||u.compareAbs(e)>=0;) {
            n=u.divmod(e), u=n.quotient; var p=n.remainder; p.isNegative()&&(p=e.minus(p).abs(), u=u.next()), i.push(p.toJSNumber());
        }return i.push(u.toJSNumber()), {value:i.reverse(), isNegative:o};
    }function G(t, e, r) {
        var o=F(t, e); return(o.isNegative?"-":"")+o.value.map(function(t) {
            return function(t, e) {
                return t<(e=e||n).length?e[t]:"<"+t+">";
            }(t, r);
        }).join("");
    }function H(t) {
        if(l(+t)) {
            var e=+t; if(e===g(e))return i?new s(BigInt(e)):new a(e); throw new Error("Invalid integer: "+t);
        }var r="-"===t[0]; r&&(t=t.slice(1)); var o=t.split(/e/i); if(o.length>2)throw new Error("Invalid integer: "+o.join("e")); if(2===o.length) {
            var n=o[1]; if("+"===n[0]&&(n=n.slice(1)), (n=+n)!==g(n)||!l(n))throw new Error("Invalid integer: "+n+" is not a valid exponent."); var u=o[0], f=u.indexOf("."); if(f>=0&&(n-=u.length-f-1, u=u.slice(0, f)+u.slice(f+1)), n<0)throw new Error("Cannot include negative exponent part for integers"); t=u+=new Array(n+1).join("0");
        }if(!/^([0-9][0-9]*)$/.test(t))throw new Error("Invalid integer: "+t); if(i)return new s(BigInt(r?"-"+t:t)); for(var v=[], y=t.length, c=y-7; y>0;)v.push(+t.slice(c, y)), (c-=7)<0&&(c=0), y-=7; return h(v), new p(v, r);
    }function K(t) {
        return"number"==typeof t?function(t) {
            if(i)return new s(BigInt(t)); if(l(t)) {
                if(t!==g(t))throw new Error(t+" is not an integer."); return new a(t);
            }return H(t.toString());
        }(t):"string"==typeof t?H(t):"bigint"==typeof t?new s(t):t;
    }p.prototype.toArray=function(t) {
        return F(this, t);
    }, a.prototype.toArray=function(t) {
        return F(this, t);
    }, s.prototype.toArray=function(t) {
        return F(this, t);
    }, p.prototype.toString=function(e, r) {
        if(e===t&&(e=10), 10!==e)return G(this, e, r); for(var o, n=this.value, i=n.length, u=String(n[--i]); --i>=0;)o=String(n[i]), u+="0000000".slice(o.length)+o; return(this.sign?"-":"")+u;
    }, a.prototype.toString=function(e, r) {
        return e===t&&(e=10), 10!=e?G(this, e, r):String(this.value);
    }, s.prototype.toString=a.prototype.toString, s.prototype.toJSON=p.prototype.toJSON=a.prototype.toJSON=function() {
        return this.toString();
    }, p.prototype.valueOf=function() {
        return parseInt(this.toString(), 10);
    }, p.prototype.toJSNumber=p.prototype.valueOf, a.prototype.valueOf=function() {
        return this.value;
    }, a.prototype.toJSNumber=a.prototype.valueOf, s.prototype.valueOf=s.prototype.toJSNumber=function() {
        return parseInt(this.toString(), 10);
    }; for(var Q=0; Q<1e3; Q++)u[Q]=K(Q), Q>0&&(u[-Q]=K(-Q)); return u.one=u[1], u.zero=u[0], u.minusOne=u[-1], u.max=z, u.min=R, u.gcd=k, u.lcm=function(t, e) {
        return t=K(t).abs(), e=K(e).abs(), t.divide(k(t, e)).multiply(e);
    }, u.isInstance=function(t) {
        return t instanceof p||t instanceof a||t instanceof s;
    }, u.randBetween=function(t, r, o) {
        t=K(t), r=K(r); var n=o||Math.random, i=R(t, r), p=z(t, r).subtract(i).add(1); if(p.isSmall)return i.add(Math.floor(n()*p)); for(var a=F(p, e).value, s=[], l=!0, f=0; f<a.length; f++) {
            var v=l?a[f]+(f+1<a.length?a[f+1]/e:0):e, h=g(n()*v); s.push(h), h<a[f]&&(l=!1);
        }return i.add(u.fromArray(s, e, !1));
    }, u.fromArray=function(t, e, r) {
        return $(t.map(K), K(e||10), r);
    }, u;
}();
