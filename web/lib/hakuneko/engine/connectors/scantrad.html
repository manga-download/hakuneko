<link rel="import" href="../connector.html">

<script>

    /**
     * @author Neogeek
     */
    class ScanTrad extends Connector {

        /**
         *
         */
        constructor() {
            super();
            super.id         = 'scantrad';
            super.label      = 'ScanTrad';
            this.tags        = [ 'manga', 'french', 'high-quality', 'scanlation' ];
            this.url         = 'https://scantrad.fr';
        }

        /**
         *
         */
        _getMangaList( callback ) {
            this.fetchDOM( this.url + '/mangas', '#projects-list li a' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.querySelector('.project-name').innerHTML.trim()
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
            this.fetchDOM( this.url + manga.id, '#project-chapters-list li' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element.querySelector('a') ),
                        title: element.querySelector('.name-chapter').textContent.trim(),
                        language: 'fr'
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
            this.fetchDOM( request, 'select[name="chapter-page"].mobile option' )
            .then( data => {
                let pageLinks = data.map( element => this.createConnectorURI( this.getAbsolutePath( element.value, request.url ) ) );
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
            let request = new Request( payload, this.requestOptions );
            // TODO: only perform requests when from download manager
            // or when from browser for preview and selected chapter matches
            return this.fetchDOM( request, '#content .image source' )
            .then( data => super._handleConnectorURI( this.getAbsolutePath( data[0], request.url ) ) );
        }
    }

</script>
