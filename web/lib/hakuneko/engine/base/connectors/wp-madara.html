<link rel="import" href="../connector.html">

<script>

    /**
     * Template
     */
    class WordPressMadara extends Connector {

        /**
         *
         */
        constructor() {
            super();
            super.id         = undefined;
            super.label      = undefined;
            this.url         = undefined;

            this.queryMangas = 'div.post-title h5 a';
            this.queryChapters = 'li.wp-manga-chapter > a';
            this.queryPages = 'div.page-break source';

            this.formManga = new URLSearchParams();
            this.formManga.append( 'action', 'madara_load_more' );
            this.formManga.append( 'template', 'madara-core/content/content-archive' );
            this.formManga.append( 'page', '0' );
            this.formManga.append( 'vars[paged]', '0' );
            this.formManga.append( 'vars[post_type]', 'wp-manga' );
            this.formManga.append( 'vars[posts_per_page]', '250' );
            // inject `madara.query_vars` into any website using wp-madara to see full list of supported vars
        }

        /**
         *
         */
        _getMangaListFromPages( page ) {
            page = page || 0;
            this.formManga.set( 'page', page );
            this.requestOptions.method = 'POST';
            this.requestOptions.body = this.formManga.toString();
            this.requestOptions.headers.set( 'content-type', 'application/x-www-form-urlencoded' );
            let uri = this.url + '/wp-admin/admin-ajax.php';
            let promise = this.fetchDOM( uri, this.queryMangas, 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, uri ),
                        title: element.text.trim()
                    };
                } );
                if( mangaList.length > 0 ) {
                    return this._getMangaListFromPages( page + 1 )
                    .then( mangas => mangaList.concat( mangas ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
            this.requestOptions.headers.delete( 'content-type' );
            delete this.requestOptions.body;
            this.requestOptions.method = 'GET';
            return promise;
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
            let uri = new URL( manga.id, this.url );
            this.fetchDOM( uri.href, this.queryChapters )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, uri.href ),
                        title: element.text.replace( manga.title, '' ).trim(),
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
            let uri = new URL( chapter.id, this.url );
            // TODO: setting this parameter seems to be problematic for various website (e.g. ChibiManga server will crash)
            uri.searchParams.set( 'style', 'list' );
            let request = new Request( uri.href, this.requestOptions );
            this.fetchDOM( request, this.queryPages )
            .then( data => {
                let pageLinks = data.map( element => this.createConnectorURI( this.getAbsolutePath( element.dataset['src'] || element, request.url ) ) );
                callback( null, pageLinks );
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
            let uri = new URL( payload );
            // TODO: only perform requests when from download manager
            // or when from browser for preview and selected chapter matches
            this.requestOptions.headers.set( 'x-referer', uri.origin );
            let promise = super._handleConnectorURI( payload );
            this.requestOptions.headers.delete( 'x-referer' );
            return promise;
        }
    }

</script>