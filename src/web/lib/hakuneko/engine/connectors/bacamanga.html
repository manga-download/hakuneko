<link rel="import" href="wp-emanga.html">

<script>

    /**
     * 
     */
    class BacaManga extends WordPressEManga {

        /**
         * limited access for indonesian (and surounding) regions only
         */
        constructor() {
            super();
            super.id         = 'bacamanga';
            super.label      = 'BacaManga';
            this.tags        = [ 'manga', 'indonesian' ];
            this.url         = 'https://bacamanga.co';
            this.path        = '/manga/?list';

            this.queryMangas = 'div#content div.soralist ul li a.series';
            this.queryChapters = 'div.bxcl ul li span.lchx a';
        }

        /**
         *
         */
        _getPageList( manga, chapter, callback ) {
            let request = new Request( this.url + chapter.id, this.requestOptions );
            return fetch( request )
            .then( response => response.text() )
            .then( data => {
                let encoded = data.match( /bm_?content\s*=\s*atob\s*\(\s*['"]([^'"]+)['"]\s*\)/ )[1];
                let decoded = decodeURIComponent( ( atob( encoded ) ).replace( /\+/g, '%20' ) );
                let regex = /src\s*=\s*['"]([^'"]+)['"]/g;
                let match;
                let pageLinks = [];
                while( match = regex.exec( decoded ) ) {
                    pageLinks.push( match[1] );
                }
                callback( null, pageLinks );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
        }
    }

</script>