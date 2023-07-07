import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class INKR extends Connector {
    constructor() {
        super();
        super.id = 'inkr';
        super.label = 'INKR';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://comics.inkr.com';
        this.nextInstance = 'b023df32bc9708e85db0b51983a2e76fce7be924';

    }

    async _initializeConnector() {
        const uri = new URL(this.url);
        const request = new Request(uri.href, this.requestOptions);
        this.nextInstance = await Engine.Request.fetchUI(request, `__NEXT_DATA__.buildId`);
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.match(/\/title\/([^/]+)/)[1];
        const request = new Request(uri, this.requestOptions);
        const data =await this.fetchDOM(request, 'meta[property="og:image:alt"]');
        const title = data[0].content.trim();
        return new Manga(this, id, title);
    }
    async _getMangas() {
        const uri = new URL(`/_next/data/${this.nextInstance}/manga/list/all.json`, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        data = new LZSTRING().decompressFromBase64(data.pageProps._c);
        data = JSON.parse(data);
        const obj = unpacker.unpack(data[0], data[1]);
        const mangas = obj.icd.filter(element => element[0].startsWith('ik-title'));
        console.log(mangas);
        return mangas.map(element => {
            return {
                id :  element[0],
                title : element[1].name.trim()
            };
        });

    }
    async _getChapters(manga) {
        //https://comics.inkr.com/_next/data/b023df32bc9708e85db0b51983a2e76fce7be924/title/1227-a-sign-of-affection/chapters.json
        const mangaid = manga.id.match(/ik-title-(\d+)$/)[1];
        const uri = new URL(`/_next/data/${this.nextInstance}/title/${mangaid}/chapters.json`, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        data = new LZSTRING().decompressFromBase64(data.pageProps._c);
        data = JSON.parse(data);
        const obj = unpacker.unpack(data[0], data[1]);

        const chaptersIndexes = obj.icd.find(element => element[0].startsWith('ik-title'))[1].chapterList;
        const chapters = obj.icd.filter(element => chaptersIndexes.includes(element[0]));

        return chapters
            .sort(function(a, b) {
                return a[1].order - b[1].order;
            })
            .map(chapter => {
                return{
                    id: chapter[1].oid.match(/\d+$/),
                    title : chapter[1].name.trim()
                };
            });

    }
    async _getPages(chapter) {
        const url = new URL(`/title/${chapter.manga.id}/chapter/${chapter.id}`, this.url);
        let data = await this._getNextData(url);

        data = new LZSTRING().decompressFromBase64(data.props.pageProps._c);
        data = JSON.parse(data);
        const obj = unpacker.unpack(data[0], data[1]);

        const ikchapter = 'ik-chapter-'+ chapter.id;
        const chap = obj.icd.find(element=> element[0] == ikchapter);
        return !chap[1].chapterPages ? [] : chap[1].chapterPages.map(page => this.createConnectorURI(page));
    }

    async _handleConnectorURI(payload) {
        const response = await fetch(new Request(payload.url + '/w1600.ikc'), {
            headers: {
                'ikc-platform': 'android',
                'cf-ipcountry': 'VN',
                'user-agent': 'okhttp/4.9.1',
            },
        });
        let encryptedData = new Uint8Array(await response.arrayBuffer());

        const iv = CryptoJS.lib.WordArray.create(encryptedData.slice(4, 20));
        const ciphertext = CryptoJS.lib.WordArray.create(encryptedData.slice(20));

        const key = CryptoJS.enc.Hex.parse('454d514b6377597151746c4832394b7a535a73446f62484c316d48767a6f746c');

        const decrypted = CryptoJS.AES.decrypt({ ciphertext }, key, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.NoPadding,
        });

        const buffer = {
            mimeType: response.headers.get('content-type'),
            data :  this.convertWordArrayToUint8Array(decrypted)
        };

        this._applyRealMime(buffer);
        return buffer;
    }

    convertWordArrayToUint8Array (wordArray) {
        var len = wordArray.words.length,
            u8_array = new Uint8Array(len << 2),
            offset = 0,
            word,
            i;
        for (i = 0; i < len; i++) {
            word = wordArray.words[i];
            u8_array[offset++] = word >> 24;
            u8_array[offset++] = word >> 16 & 255;
            u8_array[offset++] = word >> 8 & 255;
            u8_array[offset++] = word & 255;
        }
        return u8_array;
    }

    async _getNextData(request) {
        const [data] = await this.fetchDOM(request, '#__NEXT_DATA__');
        return JSON.parse(data.textContent);
    }

}

/***************************************************/
// BEGIN INKR
/**************************************************/

var unpacker = function() {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const magicalMap = {};
    for (let h = 0; h < charset.length; h++) {
        const t = charset[h];
        magicalMap[t] = h;
    }
    const mapsize = charset.length;
    var instanceObj={
        unpack:function (t, e) {
            if ('' === e || '_' === e) return null;
            const n = t[instanceObj.decodeKey(e)];
            if (null === n) return n;
            switch (typeof n) {
                case 'undefined':
                case 'number':
                    return n;
                case 'string':
                    switch (n[0] + n[1]) {
                        case 'b|':
                            return instanceObj.decodeBool(n);
                        case 'o|':
                            return function (t, e) {
                                if ('o|' === e) return {
                                };
                                const n = {},
                                    r = e.split('|');
                                let o = instanceObj.unpack(t, r[1]);
                                const i = r.length;
                                i - 2 !== 1 ||Array.isArray(o) ||(o = [o]);
                                for (let a = 2; a < i; a++) {
                                    const e = o[a - 2];
                                    let i = r[a];
                                    i = instanceObj.unpack(t, i),
                                    n[e] = i;
                                }
                                return n;
                            }(t, n);
                        case 'n|':
                            return instanceObj.decodeNum(n);
                        case 'a|':
                            return function (t, e) {
                                if ('a|' === e) return [];
                                const n = e.split('|'),
                                    r = n.length - 1,
                                    o = new Array(r);
                                for (let i = 0; i < r; i++) {
                                    let e = n[i + 1];
                                    e = instanceObj.unpack(t, e),
                                    o[i] = e;
                                }
                                return o;
                            }(t, n);
                        default:
                            return instanceObj.decodeStr(n);
                    }
            }
            return null;
        },

        d:function(t) {
            return ':' === t[0] ? instanceObj.s(t.substring(1)).toString() : instanceObj.s_to_int(t).toString();
        },
        u:function(t) {
            return t.split('').reverse().join('');
        },
        s_to_num:function(e) {
            if ('-' === e[0]) return - instanceObj.s_to_num(e.substr(1));
            let[n,
                r,
                o] = e.split('.');
            if (!r) return instanceObj.s_to_int(n);
            n = instanceObj.d(n),
            r = instanceObj.d(r),
            r = instanceObj.u(r);
            let s = n + '.' + r;
            if (o) {
                s += 'e';
                let t = !1;
                '-' === o[0] &&
          (t = !0, o = o.slice(1)),
                o = instanceObj.d(o),
                o = instanceObj.u(o),
                s += t ? - o : + o;
            }
            return + s;
        },
        s_to_int: function(t) {
            let e = 0,
                n = 1;
            for (let i = t.length - 1; i >= 0; i--) {
                const s = t[i];
                let a = magicalMap[s];
                a *= n;
                e += a;
                n *= mapsize;
            }
            return e;
        },

        s: function() {},
        /*
        s: function(t) {
        let e = BigInt(0);
        let n = BigInt(1);
        const i = BigInt(r);
        for (let r = t.length - 1; r >= 0; r--) {
            const s = t[r];
            let a = BigInt(o[s]);
            a *= n,
            e += a,
            n *= i;
        }
        return e;
        },*/
        decodeNum: function (t) {
            return t = t.replace('n|', ''),
            instanceObj.s_to_num(t);
        },

        decodeKey: function(t) {
            return 'number' === typeof t ? t : instanceObj.s_to_int(t);
        },

        decodeBool: function(t) {
            switch (t) {
                case 'b|T':
                    return !0;
                case 'b|F':
                    return !1;
            }
            return !!t;
        },
        decodeStr: function(t) {
            return 's|' === t[0] + t[1] ? t.substr(2) : t;
        },
    };
    return instanceObj;
}();

var LZSTRING = function () {
    var //r,
        o = function () {
            var t = String.fromCharCode,
                e = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
                // n = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$',
                r = {};
            function o(t, e) {
                if (!r[t]) {
                    r[t] = {};
                    for (var n = 0; n < t.length; n++) r[t][t.charAt(n)] = n;
                }
                return r[t][e];
            }
            var i = {
                decompressFromBase64: function (t) {
                    return null == t ? '' : '' == t ? null : i._decompress(t.length, 32, function (n) {
                        return o(e, t.charAt(n));
                    });
                },
                _decompress: function (e, n, r) {
                    var o,
                        i,
                        s,
                        a,
                        c,
                        u,
                        l,
                        d = [],
                        h = 4,
                        f = 4,
                        p = 3,
                        g = '',
                        m = [],
                        y = {
                            val: r(0),
                            position: n,
                            index: 1
                        };
                    for (o = 0; o < 3; o += 1) d[o] = o;
                    for (s = 0, c = Math.pow(2, 2), u = 1; u != c; ) a = y.val & y.position,
                    y.position >>= 1,
                    0 == y.position &&
            (y.position = n, y.val = r(y.index++)),
                    s |= (a > 0 ? 1 : 0) * u,
                    u <<= 1;
                    switch (s) {
                        case 0:
                            for (s = 0, c = Math.pow(2, 8), u = 1; u != c; ) a = y.val & y.position,
                            y.position >>= 1,
                            0 == y.position &&
                (y.position = n, y.val = r(y.index++)),
                            s |= (a > 0 ? 1 : 0) * u,
                            u <<= 1;
                            l = t(s);
                            break;
                        case 1:
                            for (s = 0, c = Math.pow(2, 16), u = 1; u != c; ) a = y.val & y.position,
                            y.position >>= 1,
                            0 == y.position &&
                (y.position = n, y.val = r(y.index++)),
                            s |= (a > 0 ? 1 : 0) * u,
                            u <<= 1;
                            l = t(s);
                            break;
                        case 2:
                            return '';
                    }
                    for (d[3] = l, i = l, m.push(l); ; ) {
                        if (y.index > e) return '';
                        for (s = 0, c = Math.pow(2, p), u = 1; u != c; ) a = y.val & y.position,
                        y.position >>= 1,
                        0 == y.position &&
              (y.position = n, y.val = r(y.index++)),
                        s |= (a > 0 ? 1 : 0) * u,
                        u <<= 1;
                        switch (l = s) {
                            case 0:
                                for (s = 0, c = Math.pow(2, 8), u = 1; u != c; ) a = y.val & y.position,
                                y.position >>= 1,
                                0 == y.position &&
                  (y.position = n, y.val = r(y.index++)),
                                s |= (a > 0 ? 1 : 0) * u,
                                u <<= 1;
                                d[f++] = t(s),
                                l = f - 1,
                                h--;
                                break;
                            case 1:
                                for (s = 0, c = Math.pow(2, 16), u = 1; u != c; ) a = y.val & y.position,
                                y.position >>= 1,
                                0 == y.position &&
                  (y.position = n, y.val = r(y.index++)),
                                s |= (a > 0 ? 1 : 0) * u,
                                u <<= 1;
                                d[f++] = t(s),
                                l = f - 1,
                                h--;
                                break;
                            case 2:
                                return m.join('');
                        }
                        if (0 == h && (h = Math.pow(2, p), p++), d[l]) g = d[l];
                        else {
                            if (l !== f) return null;
                            g = i + i.charAt(0);
                        }
                        m.push(g),
                        d[f++] = i + g.charAt(0),
                        i = g,
                        0 == --h &&
              (h = Math.pow(2, p), p++);
                    }
                }
            };
            return i;
        } ();
    return o;
};

/***************************************************/
// END INKR
/**************************************************/
