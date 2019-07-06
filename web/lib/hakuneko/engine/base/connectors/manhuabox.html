<link rel="import" href="../connector.html">

<script>

    /**
     *
     */
    class ManhuaBox extends Connector {

        /**
         *
         */
        constructor() {
            super();
            super.id         = 'manhuabox';
            super.label      = 'ManhuaBox';
            this.tags        = [ 'webtoon', 'english' ];
            this.url         = 'https://rogame.site';
        }

        /**
         *
         */
        _getMangaListFromPages( page ) {
            page = page || 1;
            let uri = this.url + '/titles/?page=' + page;
            return this.fetchDOM( uri, 'div.main-content', 5 )
            .then( data => {
                let mangaList = [...data[0].querySelectorAll( 'div.row a.blog-entry' )].map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, uri ),
                        title: element.querySelector( 'div.blog-content-body h2' ).innerText.trim()
                    };
                } );
                if( data[0].querySelector( 'div.row nav ul.pagination a i.fa-angle-right' ) ) {
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
            this._getMangaListFromPages( 1 )
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
            this.fetchDOM( this.url + manga.id, 'div.container div.blog-entries div.row table.table tr td:first-of-type a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, this.url + manga.id ),
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
            let request = new Request( this.url + chapter.id, this.requestOptions );
            this.fetchDOM( request, 'div#all-pages div.modal-dialog div.modal-content div.modal-body ul li a' )
            .then( data => {
                let pageList = data.map( element => this.createConnectorURI( this.getAbsolutePath( element, request.url ) ) );
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
            return this.fetchDOM( request, 'div.container div.reader a source' )
            .then( data => super._handleConnectorURI( this.getAbsolutePath( data[0], request.url ) ) );
        }
    }

</script>