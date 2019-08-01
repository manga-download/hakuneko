<link rel="import" href="../connector.html">

<script>

    /**
     * Template
     */
    class WordPressEManga extends Connector {

        /**
         *
         */
        constructor() {
            super();
            super.id         = undefined;
            super.label      = undefined;
            this.tags        = [];
            this.url         = undefined;
            this.path        = '/list/';

            this.queryMangas = 'div#content div.soralist ul li a.series';
            this.queryChapters = 'div.cl ul li span.leftoff a';
            this.queryPages = 'div#readerarea source[src]:not([src=""])';
        }

        /**
         *
         */
        _getMangaList( callback ) {
            this.fetchDOM( this.url + this.path, this.queryMangas )
            .then( data => {
                let mangaList = data.map( element => {
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
            return this.fetchDOM( this.url + manga.id, this.queryChapters )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
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
            return this.fetchDOM( this.url + chapter.id, this.queryPages )
            .then( data => {
                let pageLinks = data.map( element => {
                    let link = element.dataset['lazySrc'] || element.src;
                    return ( link.startsWith( 'http' ) ? '' : 'http:' ) + link;
                } )
                .filter( link => !link.includes( 'histats.com' ) );
                callback( null, pageLinks );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
        }
    }

</script>