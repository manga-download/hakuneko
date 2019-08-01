<link rel="import" href="../connector.html">

<script>

    /**
     *
     */
    class Submanga extends Connector {

        /**
         *
         */
        constructor() {
            super();
            // Public members for usage in UI (mandatory)
            super.id         = 'submanga';
            super.label      = 'Submanga';
            this.tags        = [ 'manga', 'spanish' ];
            super.isLocked   = false;
            // Private members for internal usage only (convenience)
            this.url         = 'https://submanga.online';
            // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
            this.config = undefined;
        }

        /**
         * Very similar to MangaReaderCMS
         */
        _getMangaList( callback ) {
            this.fetchDOM( this.url + '/changeMangaList?type=text', 'div.panel-body ul.manga-list li a.alpha-link' )
            .then( data => {
                let mangaList = data.map( element => {
                    this.cfMailDecrypt( element );
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
         * Same as in <LeoManga>
         */
        _getChapterList( manga, callback ) {
            this.fetchDOM( this.url + manga.id, 'div.capitulos-list table.table tbody tr td:first-of-type a' )
            .then( data => {
                let chapterList = data.map( element => {
                    this.cfMailDecrypt( element );
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: 'spanish'
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
            this.fetchDOM( this.url + chapter.id, 'div#all source.img-responsive' )
            .then( data => {
                let pageLinks = data.map( element => element.dataset.src.trim() );
                callback( null, pageLinks );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
        }
    }

</script>