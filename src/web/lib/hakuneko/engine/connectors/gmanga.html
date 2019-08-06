<link rel="import" href="../connector.html">

<script>

    /**
     *
     */
    class GManga extends Connector {

        /**
         *
         */
        constructor() {
            super();
            super.id         = 'gmanga';
            super.label      = 'GManga';
            this.tags        = [ 'manga', 'arabic' ];
            this.url         = 'https://gmanga.me';

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

        /**
         *
         */
        _getMangaListFromPages( page ) {
            page = page || 1;
            this._setMangaRequestOptions( page );
            let request = new Request( this.url + '/api/mangas/search', this.requestOptions );
            this._clearRequestOptions();
            return this.fetchJSON( request )
            .then( data => {
                data = data[ 'iv' ] ? this._haqiqa( data.data ) : data;
                if( !data.mangas || !data.mangas.length ) {
                    return Promise.resolve( [] );
                }
                let mangaList = data.mangas.map( manga => {
                    return {
                        id: manga.id,
                        title: manga.title
                    };
                } );
                return this._getMangaListFromPages( page + 1 )
                .then( mangas => mangas.concat( mangaList ) );
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
            fetch( this.url + '/api/mangas/' + manga.id, this.requestOptions )
            .then( response => response.json() )
            .then( data => {
                data = data[ 'isCompact' ] ? this._unpack( data ) : data;
                let chapterList = data.mangaReleases.map( chapter => {
                    let title = 'Vol.' + chapter.volume + ' Ch.' + chapter.chapter;
                    title += ( chapter.title ? ' - ' + chapter.title : '' );
                    title += ( chapter.team_name ? ' [' + chapter.team_name + ']' : '' );
                    return {
                        id: manga.id + '/chapter/' + chapter.chapter + '/' + chapter.team_name,
                        title: title,
                        language: 'ae'
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
            fetch( this.url + '/mangas/' + chapter.id, this.requestOptions )
            .then( response => response.text() )
            .then( data => {
                let pageList = data.match( /"hq_pages"\s*:\s*"(.*?)"\s*,/ )[1].split( '\\n' ).map( page => {
                    // TODO: Create protocol link and get keys ad-hoc per request, because of limited validity (lease time)
                    let uri = new URL( page.replace( '\\r', '' ).trim(), 'https://media.gmanga.me/uploads/releases/' );
                    uri.searchParams.set( 'ak', parseInt( ( Date.now() ) / 1000 + 120 - 5 ).toString( '36' ) );
                    return uri.href;
                } );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
        }

        /**
         *
         */
         _setMangaRequestOptions( page ) {
            this.mangaSearch.page = page;
            this.requestOptions.method = 'POST';
            this.requestOptions.headers.set( 'content-type', 'application/json' );
            this.requestOptions.body = JSON.stringify( this.mangaSearch );
        }

        /**
         *
         */
        _clearRequestOptions() {
            delete this.requestOptions.body;
            this.requestOptions.headers.delete( 'content-type' );
            this.requestOptions.method = 'GET';
            this.mangaSearch.page = 0;
        }

        /********************
         *** BEGIN GMANGA ***
         *******************/

        _r(t) {
            return (this._r = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
                return typeof t
            }
            : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
            }
            )(t)
        }

        _a(t) {
            return (this._a = "function" == typeof Symbol && "symbol" === this._r(Symbol.iterator) ? function(t) {
                return this._r(t)
            }.bind(this)
            : function(t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : this._r(t)
            }.bind(this)
            )(t)
        }

        _isObject(t) {
            var e = this._a(t);
            return "function" === e || "object" === e && !!t
        }

        _dataExists(t) {
            var e = null !== t;
            return "object" === this._a(t) ? e && 0 !== Object.keys(t).length : "" !== t && void 0 !== t && e
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
            return JSON.parse(c.default.enc.Utf8.stringify(a))
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
                    i += 1
                }.bind(this)),
                o
            }
            if (t.isArray) {
                o = [];
                return r.forEach(function(t) {
                    var e = {}
                    , r = 0;
                    n.forEach(function(n) {
                        e[n] = t[r],
                        r += 1
                    }),
                    o.push(e)
                }),
                o
            }
        }

        /******************
         *** END GMANGA ***
         *****************/
    }

</script>