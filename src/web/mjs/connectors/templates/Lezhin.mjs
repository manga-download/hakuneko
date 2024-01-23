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
        const uri = new URL('/lz-api/v2/contents', this.apiURL);
        uri.searchParams.set('menu', 'general');
        uri.searchParams.set('limit', this.mangasPerPage);
        uri.searchParams.set('offset', page * this.mangasPerPage);
        uri.searchParams.set('order', 'popular');
        const request = new Request(uri, this.requestOptions);

        request.headers.set('X-LZ-Adult', '0');
        request.headers.set('X-LZ-AllowAdult', 'true');
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

        //default to scrollsInfo if pagesInfo doesnt exists (same structure)
        const content = data.data.extra.episode.pagesInfo ? data.data.extra.episode.pagesInfo : data.data.extra.episode.scrollsInfo;
        return content.map(scroll => {
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

        const scrambled = data.data.extra.comic.metadata && data.data.extra.comic.metadata.imageShuffle;

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

        // eslint-disable-next-line no-undef
        const BIGT = BigInt(t);
        // eslint-disable-next-line no-undef
        const big12 = BigInt(12);
        // eslint-disable-next-line no-undef
        const big25 = BigInt(25);
        // eslint-disable-next-line no-undef
        const big27 = BigInt(27);
        // eslint-disable-next-line no-undef
        const big32 = BigInt(32);
        // eslint-disable-next-line no-undef
        const BigXXX = BigInt('18446744073709551615');

        let e = r.state;
        e = e ^ e >> big12;
        const shifter = e << big25 & BigXXX;
        e = e ^ shifter;
        e = e ^ e >>big27;
        r.state = e & BigXXX;

        return parseInt((e >> big32) % BIGT, 10); //22

        /*
// Detailled code using bigint js library, for references purposes. Test manga : Jinx, Chapter 1, Lezhin EN
       var BIGT = bigInt(t);
       var big12 = bigInt(12);
       var big25 = bigInt(25);
       var big27 = bigInt(27);
       var big32 = bigInt(32);
       var BigXXX = bigInt('18446744073709551615');

        var e = r.state; //6252351865552896n
        e = e.xor(e.shiftRight(big12)); //6253027791257424n
        var shifter = e.shiftLeft(big25).and(BigXXX); //3528721484988022784n
        e = e.xor(shifter); //3525964907269111632n
        e = e.xor(e.shiftRight(big27)); //3525964881051480971n
        r.state = e.and(BigXXX); //3525964881051480971n

        return e.shiftRight(big32).remainder(BIGT).toJSNumber(); //22
*/

    },

    this.get = function () {
        return r.order;
    },

    this.seed = t,
    // eslint-disable-next-line no-undef
    this.state = BigInt(this.seed);
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
