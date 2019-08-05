<link rel="import" href="wp-madara.html">

<script>

    /**
     *
     */
    class HentaiRead extends WordPressMadara {

        /**
         *
         */
        constructor() {
            super();
            super.id         = 'hentairead';
            super.label      = 'HentaiRead';
            this.tags        = [ 'hentai', 'english' ];
            this.url         = 'https://hentairead.com';
        }

        /**
         * Very similar to tritiniascans except that this websites uses an array instead of an object
         */
        /*
        _getPageList( manga, chapter, callback ) {
            let script = `
                new Promise( ( resolve, reject ) => {
                    // seems lazy-loaded scripts => delay
                    setTimeout(() => {
                        let images;
                        if( window.chapter_preloaded_images ) {
                            images = chapter_preloaded_images;
                        } else {
                            images = [...document.querySelectorAll( '${ this.queryPages }' )].map( image => image.src );
                        }
                        resolve( images );
                    }, 500);
                } );
            `;
            let request = new Request( this.url + chapter.id, this.requestOptions );
            Engine.Request.fetchUI( request, script )
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
        }
        */

        /**
         * 
         */
        _getPageList( manga, chapter, callback ) {
            let request = new Request( this.url + chapter.id, this.requestOptions );
            fetch( request )
            .then( response => response.text() )
            .then( data => {
                let pageList = JSON.parse( data.match( /chapter_preloaded_images\s*=\s*(\[[^\]]+\])/ )[1] );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
        }
    }

</script>