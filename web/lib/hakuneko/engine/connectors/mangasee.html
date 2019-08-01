<link rel="import" href="../connector.html">

<script>

    /**
     * @author Neogeek
     * Same as MangaLife
     */
    class MangaSee extends Connector {

        /**
         *
         */
        constructor() {
            super();
            super.id         = 'mangasee';
            super.label      = 'MangaSee';
            this.tags        = [ 'manga', 'english' ];
            this.url         = 'https://mangaseeonline.us';
        }

        /**
         *
         */
        _getMangaList( callback ) {
            fetch( this.url + '/directory/', this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive manga list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let dom = this.createDOM( data );
                let mangaList = [...dom.querySelectorAll( '#content p a' )].map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim()
                    };
                } );
                callback( null, mangaList );
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
            fetch( this.url + manga.id, this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive chapter list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let dom = this.createDOM( data );
                let chapterList = [...dom.querySelectorAll( '.chapter-list a[class="list-group-item"]' )].map( element => {
                    let title = element.querySelector( 'span.chapterLabel' ).textContent;
                    return {
                        id: this.getRelativeLink( element ).replace( /-page-\d+/, '' ),
                        title: title.replace( manga.title, '' ).trim(),
                        language: 'en'
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
            this.fetchDOM( request, 'div.fullchapimage source' )
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
            return fetch( request )
            .then( response => response.blob() )
            .then( data => this._blobToBuffer( data ) )
            .then( data => {
                this._applyRealMime( data );
                return Promise.resolve( data );
            } );
        }
    }

</script>