<link rel="import" href="../connector.html">

<script>

    /**
     *
     */
    class ComicWalker extends Connector {

        /**
         *
         */
        constructor() {
            super();
            super.id         = 'comicwalker';
            super.label      = 'コミックウォーカー (ComicWalker)';
            this.tags        = [ 'manga', 'japanese' ];
            this.url         = 'https://comic-walker.com';
        }

        /**
         * 
         */
        _getMangaFromURI( uri ) {
            let request = new Request( uri.href, this.requestOptions );
            return this.fetchDOM( request, 'div#mainContent div#detailIndex div.comicIndex-box h1' )
            .then( data => {
                let id = uri.pathname + uri.search;
                let title = data[0].textContent.trim();
                return Promise.resolve( new Manga( this, id, title ) );
            } );
        }

        /**
         *
         */
        _getMangaListFromPages( mangaPageLinks, index ) {
            index = index || 0;
            let request = new Request( mangaPageLinks[ index ], this.requestOptions );
            return this.fetchDOM( request, 'div.comicPage ul.tileList li a p.tileTitle span', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element.closest( 'a' ), request.url ),
                        title: element.textContent.replace( /^[^\s]+\s/, '' ).trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this._getMangaListFromPages( mangaPageLinks, index + 1 )
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
            let request = new Request( this.url + '/contents/list/', this.requestOptions );
            this.fetchDOM( request, 'div.comicPage div.pager ul.clearfix li:nth-last-of-type(2) a' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [...( new Array( pageCount ) ).keys()].map( page => request.url + '?p=' + ( page + 1 ) );
                return this._getMangaListFromPages( pageLinks );
            } )
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
            let request = new Request( this.url + manga.id, this.requestOptions );
            this.fetchDOM( request, 'div#ulreversible ul#reversible li a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.title.replace( manga.title, '' ).trim(),
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
            let request = new Request( this.url + chapter.id, this.requestOptions );
            this.fetchDOM( request, 'div#cw-viewer' )
            .then( data => {
                let uri = `${data[0].dataset.apiEndpointUrl}/api/v1/comicwalker/episodes/${data[0].dataset.episodeId}/frames`;
                request = new Request( uri, this.requestOptions );
                return this.fetchJSON( request );
            } )
            .then( data => {
                let pageList = data.data.result.map( page => this.createConnectorURI( this.getAbsolutePath( page.meta.source_url, this.url ) ) );               
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
        _handleConnectorURI( payload ) {
            let request = new Request( payload, this.requestOptions );
            // TODO: only perform requests when from download manager
            // or when from browser for preview and selected chapter matches
            return fetch( request )
            .then( response => response.arrayBuffer() )
            .then( data => this._decrypt( data, request.url.split( '/' )[6] ) );
        }
        
        /**
         *
         */
        _decrypt( encrypted, passphrase ) {
            let key = this._generateKey( passphrase );
            let decrypted = this._xor( encrypted, key );
            return Promise.resolve( {
                mimeType: 'image/jpeg',
                data: decrypted
            } );
        }

        /*******************************
         *** COMIC-WALKER CODE BEGIN ***
         ******************************/

        _generateKey(t) {
            var e = t.slice(0, 16).match(/[\da-f]{2}/gi);
            if (null != e)
                return new Uint8Array(e.map(function(t) {
                    return parseInt(t, 16)
                }));
            throw new Error("failed generate key.")
        }

        _xor(t, e) {
            for (var n = new Uint8Array(t), r = n.length, i = e.length, o = new Uint8Array(r), a = 0; a < r; a += 1)
                o[a] = n[a] ^ e[a % i];
            return o
        }

        /*****************************
         *** COMIC-WALKER CODE END ***
         ****************************/
    }

</script>