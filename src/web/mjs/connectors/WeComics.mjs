import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class WeComics extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'wecomics';
        super.label = 'WeComics';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://m.wecomics.com';
    }

    /**
     *
     */
    _getMangaListFromPages( page ) {
        page = page || 1;
        let request = new Request( this.url + '/comic/getIndexList/page/' + page, this.requestOptions );
        return this.fetchJSON( request )
            .then( data => {
                let mangaList = data.data.comic_list.map( manga => {
                    return {
                        id: manga.comic_id,
                        title: manga.title.trim()
                    };
                } );
                if( mangaList.length > 0 ) {
                    return this._getMangaListFromPages( page + 1 )
                        .then( mangas => mangaList.concat( mangas ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this._getMangaListFromPages()
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        let request = new Request( this.url + '/comic/getChapterList/id/' + manga.id, this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let chapterList = data.data.chapter_list.map( chapter => {
                    return {
                        id: chapter.chapter_id,
                        title: chapter.title.trim(),
                        language: ''
                    };
                } );
                callback( null, chapterList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        let request = new Request( `${this.url}/comic/getPictureList/id/${manga.id}/cid/${chapter.id}`, this.requestOptions );
        this.fetchJSON( request )
            .then( data => {
                let pageList = WeComics_Vendor.getPictureList( data.data.chapter.data );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}

/**
 *
 */
class WeComics_Vendor {

    static getPictureList( encrypted ) {
        let buff = encrypted.substr(0, 8);
        let buff_data = encrypted.substr(8);
        let rawChapStr = this.decryptFromBase64(buff_data, buff);
        let rawChapObj = JSON.parse(rawChapStr);
        return rawChapObj.picture_list.map( picture => rawChapObj.cdn_base_url + picture.picture_url );
    }

    static decryptFromBase64(e, n) {
        return void 0 === e || null === e || 0 === e.length ? e : this.l(atob(e), n);
    }

    static l(t, r) {
        return void 0 === t || null === t || 0 === t.length ? t : (r = this.c(r),
        this.u(this.e(this.s(this.n(t, !1), this.o(this.n(r, !1))), !0)));
    }

    static c(t) {
        // eslint-disable-next-line no-control-regex
        if (/^[\x00-\x7f]*$/.test(t))
            return t;
        for (var e = [], n = t.length, r = 0, i = 0; r < n; ++r,
        ++i) {
            var o = t.charCodeAt(r);
            if (o < 128)
                e[i] = t.charAt(r);
            else if (o < 2048)
                e[i] = String.fromCharCode(192 | o >> 6, 128 | 63 & o);
            else {
                if (!(o < 55296 || o > 57343)) {
                    if (r + 1 < n) {
                        var a = t.charCodeAt(r + 1);
                        if (o < 56320 && 56320 <= a && a <= 57343) {
                            var s = 65536 + ((1023 & o) << 10 | 1023 & a);
                            e[i] = String.fromCharCode(240 | s >> 18 & 63, 128 | s >> 12 & 63, 128 | s >> 6 & 63, 128 | 63 & s),
                            ++r;
                            continue;
                        }
                    }
                    throw new Error("Malformed string");
                }
                e[i] = String.fromCharCode(224 | o >> 12, 128 | o >> 6 & 63, 128 | 63 & o);
            }
        }
        return e.join("");
    }

    static n(t, e) {
        var n, r = t.length, i = r >> 2;
        0 != (3 & r) && ++i,
        e ? (n = new Array(i + 1))[i] = r : n = new Array(i);
        for (var o = 0; o < r; ++o)
            n[o >> 2] |= t.charCodeAt(o) << ((3 & o) << 3);
        return n;
    }

    static o(t) {
        return t.length < 4 && (t.length = 4), t;
    }

    static get p() {
        return 2654435769;
    }

    static r(t) {
        return 4294967295 & t;
    }

    static i(t, e, n, r, i, o) {
        return (n >>> 5 ^ e << 2) + (e >>> 3 ^ n << 4) ^ (t ^ e) + (o[3 & r ^ i] ^ n);
    }

    static s(t, e) {
        var n, o, a, s, c, u = t.length, f = u - 1;
        for (n = t[0],
        a = this.r(Math.floor(6 + 52 / u) * this.p); 0 !== a; a = this.r(a - this.p)) {
            for (s = a >>> 2 & 3,
            c = f; c > 0; --c)
                o = t[c - 1],
                n = t[c] = this.r(t[c] - this.i(a, n, o, c, s, e));
            o = t[f],
            n = t[0] = this.r(t[0] - this.i(a, n, o, 0, s, e));
        }
        return t;
    }

    static e(t, e) {
        var n = t.length
            , r = n << 2;
        if (e) {
            var i = t[n - 1];
            if (i < (r -= 4) - 3 || i > r)
                return null;
            r = i;
        }
        for (var o = 0; o < n; o++)
            t[o] = String.fromCharCode(255 & t[o], t[o] >>> 8 & 255, t[o] >>> 16 & 255, t[o] >>> 24 & 255);
        var a = t.join("");
        return e ? a.substring(0, r) : a;
    }

    static u(t, e) {
        return (void 0 === e || null === e || e < 0) && (e = t.length),
        // eslint-disable-next-line no-control-regex
        0 === e ? "" : /^[\x00-\x7f]*$/.test(t) || !/^[\x00-\xff]*$/.test(t) ? e === t.length ? t : t.substr(0, e) : e < 65535 ? function(t, e) {
            for (var n = new Array(e), r = 0, i = 0, o = t.length; r < e && i < o; r++) {
                var a = t.charCodeAt(i++);
                switch (a >> 4) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        n[r] = a;
                        break;
                    case 12:
                    case 13:
                        if (!(i < o))
                            throw new Error("Unfinished UTF-8 octet sequence");
                        n[r] = (31 & a) << 6 | 63 & t.charCodeAt(i++);
                        break;
                    case 14:
                        if (!(i + 1 < o))
                            throw new Error("Unfinished UTF-8 octet sequence");
                        n[r] = (15 & a) << 12 | (63 & t.charCodeAt(i++)) << 6 | 63 & t.charCodeAt(i++);
                        break;
                    case 15:
                        if (!(i + 2 < o))
                            throw new Error("Unfinished UTF-8 octet sequence");
                        var s = ((7 & a) << 18 | (63 & t.charCodeAt(i++)) << 12 | (63 & t.charCodeAt(i++)) << 6 | 63 & t.charCodeAt(i++)) - 65536;
                        if (!(0 <= s && s <= 1048575))
                            throw new Error("Character outside valid Unicode range: 0x" + s.toString(16));
                        n[r++] = s >> 10 & 1023 | 55296,
                        n[r] = 1023 & s | 56320;
                        break;
                    default:
                        throw new Error("Bad UTF-8 encoding 0x" + a.toString(16));
                }
            }
            return r < e && (n.length = r),
            String.fromCharCode.apply(String, n);
        }(t, e) : function(t, e) {
            for (var n = [], r = new Array(32768), i = 0, o = 0, a = t.length; i < e && o < a; i++) {
                var s = t.charCodeAt(o++);
                switch (s >> 4) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        r[i] = s;
                        break;
                    case 12:
                    case 13:
                        if (!(o < a))
                            throw new Error("Unfinished UTF-8 octet sequence");
                        r[i] = (31 & s) << 6 | 63 & t.charCodeAt(o++);
                        break;
                    case 14:
                        if (!(o + 1 < a))
                            throw new Error("Unfinished UTF-8 octet sequence");
                        r[i] = (15 & s) << 12 | (63 & t.charCodeAt(o++)) << 6 | 63 & t.charCodeAt(o++);
                        break;
                    case 15:
                        if (!(o + 2 < a))
                            throw new Error("Unfinished UTF-8 octet sequence");
                        var c = ((7 & s) << 18 | (63 & t.charCodeAt(o++)) << 12 | (63 & t.charCodeAt(o++)) << 6 | 63 & t.charCodeAt(o++)) - 65536;
                        if (!(0 <= c && c <= 1048575))
                            throw new Error("Character outside valid Unicode range: 0x" + c.toString(16));
                        r[i++] = c >> 10 & 1023 | 55296,
                        r[i] = 1023 & c | 56320;
                        break;
                    default:
                        throw new Error("Bad UTF-8 encoding 0x" + s.toString(16));
                }
                if (i >= 32766) {
                    var u = i + 1;
                    r.length = u,
                    n[n.length] = String.fromCharCode.apply(String, r),
                    e -= u,
                    i = -1;
                }
            }
            return i > 0 && (r.length = i,
            n[n.length] = String.fromCharCode.apply(String, r)),
            n.join("");
        }(t, e);
    }

}