<link rel="import" href="coreview.html">

<script>

    /**
     *
     */
    class ComicBorder extends CoreView {

        /**
         *
         */
        constructor() {
            super();
            super.id         = 'comicborder';
            super.label      = 'コミックボーダー (ComicBorder)';
            this.tags        = [ 'manga', 'japanese' ];
            this.url         = 'https://comicborder.com';
        }

        /**
         *
         */
        _getMangaList( callback ) {
            this.fetchDOM( this.url, 'ul.index-list-all li a' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.lastChild.textContent.trim()
                    };
                } );
                callback( null, mangaList );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
        }
    }

</script>