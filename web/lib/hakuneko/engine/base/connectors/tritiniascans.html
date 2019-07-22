<link rel="import" href="wp-madara.html">

<script>

    /**
     *
     */
    class TritiniaScans extends WordPressMadara {

        /**
         *
         */
        constructor() {
            super();
            super.id         = 'tritiniascans';
            super.label      = 'Tritinia Scans';
            this.tags        = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
            this.url         = 'https://tritiniascans.ml';

            this.queryPages = 'div.page-break img';
        }

        /**
         *
         */
        _getPageList( manga, chapter, callback ) {
            let script = `
                new Promise( ( resolve, reject ) => {
                    let images;
                    if( window.chapter_preloaded_images ) {
                        images = Object.keys( chapter_preloaded_images ).map( key => chapter_preloaded_images[key] );
                    } else {
                        images = [...document.querySelectorAll( '${ this.queryPages }' )].map( image => image.src );
                    }
                    resolve( images );
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
    }

</script>