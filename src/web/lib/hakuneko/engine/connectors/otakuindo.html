<link rel="import" href="wp-emanga.html">

<script>

    /**
     * Is this really a WordPressEManga theme?
     * Same as Komiku
     */
    class OtakuIndo extends WordPressEManga {

        /**
         *
         */
        constructor() {
            super();
            super.id         = 'otakuindo';
            super.label      = 'OtakuIndo';
            this.tags        = [ 'manga', 'indonesian' ];
            this.url         = 'https://otakuindo.co';
            this.path        = '/baca-manga/page/';

            this.queryMangas = 'div.news div.newslist div.newsinfo h4.newsjudul a';
            this.queryChapters = 'div#list table.chapter tr td.judulseries a';
            this.queryPages = 'div#readerareaimg source[src]:not([src=""])';
        }
        
        /**
         *
         */
        _getMangaListFromPages( page ) {
            page = page || 1;
            let request = new Request( this.url + this.path + page + '/', this.requestOptions );
            return this.fetchDOM( request, this.queryMangas, 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.text.trim()
                    };
                } );
                if( data[0].closest( 'div.nw' ).querySelector( 'div.pag-nav a.next' ) ) {
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
            this._getMangaListFromPages()
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, undefined );
            } );
        }
    }

</script>