import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class GManga extends Connector {

    constructor() {
        super();
        super.id = 'gmanga';
        super.label = 'GManga';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://gmanga.me';

        this.mangaSearch = {
            manga_types: {
                include: [1, 2, 3, 4, 5, 6, 7],
                exclude: []
            },
            story_status: { include: [], exclude: [] },
            translation_status: { include: [], exclude: [3] },
            categories: { include: [], exclude: [] },
            chapters: { min: null, max: null },
            dates: { start: null, end: null },
            page: 0
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'script[data-component-name="HomeApp"]');
        data = JSON.parse(data[0].textContent);
        let id = data.mangaDataAction.mangaData.id;
        let title = data.mangaDataAction.mangaData.title; // data.mangaDataAction.mangaData.arabic_title
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        this._setMangaRequestOptions(page);
        let request = new Request(new URL('/api/mangas/search', this.url), this.requestOptions);
        this._clearRequestOptions();
        let data = await this.fetchJSON(request);
        data = data['iv'] ? this._haqiqa(data.data) : data;
        data = data.mangas || [];
        return data.map( manga => {
            return {
                id: manga.id,
                title: manga.title
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(`/api/mangas/${manga.id}/releases`, this.url), this.requestOptions);
        let data = await this.fetchJSON(request);
        data = data['iv'] ? this._haqiqa(data.data) : data;
        data = data['isCompact'] ? this._unpack(data) : data;
        return data.releases.map(chapter => {
            let title = 'Vol.' + chapter.volume + ' Ch.' + chapter.chapter;
            title += chapter.title ? ' - ' + chapter.title : '' ;
            title += chapter.team_name ? ' [' + chapter.team_name + ']' : '' ;
            return {
                id: manga.id + '/chapter/' + chapter.chapter + '/' + chapter.team_name,
                title: title,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL('/mangas/' + chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'script[data-component-name="HomeApp"]');
        data = JSON.parse(data[0].textContent);
        let key = data.globals.mediaKey;
        let url = (data.globals.wla.configs.http_media_server || data.globals.wla.configs.media_server) + '/uploads/releases/';
        data = data.readerDataAction.readerData.release;
        let images = data.hq_pages.length > 0 ? data.hq_pages : data.mq_pages.length > 0 ? data.mq_pages : data.lq_pages;
        return images.map(image => {
            let uri = new URL(url, request.url);
            uri.pathname += image;
            uri.searchParams.set('ak', key);
            return uri.href;
        });
    }

    _setMangaRequestOptions(page) {
        this.mangaSearch.page = page;
        this.requestOptions.method = 'POST';
        this.requestOptions.headers.set('content-type', 'application/json');
        this.requestOptions.body = JSON.stringify(this.mangaSearch);
    }

    _clearRequestOptions() {
        delete this.requestOptions.body;
        this.requestOptions.headers.delete('content-type');
        this.requestOptions.method = 'GET';
        this.mangaSearch.page = 0;
    }

    /**
     *******************
     * ** BEGIN GMANGA ***
     ******************
     */

    _r(t) {
        return (this._r = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
            return typeof t;
        }
            : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
            }
        )(t);
    }

    _a(t) {
        return (this._a = "function" == typeof Symbol && "symbol" === this._r(Symbol.iterator) ? function(t) {
            return this._r(t);
        }.bind(this)
            : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : this._r(t);
            }.bind(this)
        )(t);
    }

    _isObject(t) {
        var e = this._a(t);
        return "function" === e || "object" === e && !!t;
    }

    _dataExists(t) {
        var e = null !== t;
        return "object" === this._a(t) ? e && 0 !== Object.keys(t).length : "" !== t && void 0 !== t && e;
    }

    _haqiqa(t) {
        let c = { default: CryptoJS };
        if (!this._dataExists(t) || "string" != typeof t)
            return !1;
        var e = t.split("|")
            , n = e[0]
            , r = e[2]
            , o = e[3]
            , i = c.default.SHA256(o).toString()
            , a = c.default.AES.decrypt({
                ciphertext: c.default.enc.Base64.parse(n)
            }, c.default.enc.Hex.parse(i), {
                iv: c.default.enc.Base64.parse(r)
            });
        return JSON.parse(c.default.enc.Utf8.stringify(a));
    }

    _unpack(t) {
        var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1;
        if (!t || e > t.maxLevel)
            return t;
        if (!this._isObject(t) || !t.isCompact)
            return t;
        var n = t.cols
            , r = t.rows;
        if (t.isObject) {
            var o = {}
                , i = 0;
            return n.forEach(function(t) {
                o[t] = this._unpack(r[i], e + 1),
                i += 1;
            }.bind(this)),
            o;
        }
        if (t.isArray) {
            o = [];
            return r.forEach(function(t) {
                var e = {}
                    , r = 0;
                n.forEach(function(n) {
                    e[n] = t[r],
                    r += 1;
                }),
                o.push(e);
            }),
            o;
        }
    }

    /**
     *****************
     * ** END GMANGA ***
     ****************
     */
}