<link rel="import" href="../connector.html">

<script>

    /**
     *
     */
    class NewType extends Connector {

        /**
         *
         */
        constructor() {
            super();
            super.id         = 'newtype';
            super.label      = 'NewType';
            this.tags        = [ 'manga', 'japanese' ];
            this.url         = 'https://comic.webnewtype.com';
        }

        /**
         *
         */
        _getMangaList( callback ) {
            // Cookie: contents_list_pg=1000
            // https://comic.webnewtype.com/contents/all/
            // https://comic.webnewtype.com/contents/all/more/1/
            let request = new Request( this.url + '/contents/all/', this.requestOptions );
            this.fetchDOM( request, 'section.BorderSection ul#worksPanel li.OblongCard--border > a' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.querySelector( 'div.OblongCard-content h3.OblongCard-title' ).innerText.trim()
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
            let request = new Request( this.url + manga.id, this.requestOptions );
            this.fetchDOM( request, 'section.BorderSection ul#episodeList li.ListCard > a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.querySelector( 'div.ListCard-content h3.ListCard-title' ).innerText.replace( manga.title, '' ).trim(),
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
            this.fetchDOM( request, 'div#viewerContainer' )
            .then( data => {
                let uri = this.getAbsolutePath( data[0].dataset.url, request.url );
                return this.fetchJSON( new Request( uri, this.requestOptions ) );
            } )
            .then( data => {
                let pageList = data.map( page => this.getAbsolutePath( page, request.url ) );               
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
        }
    }

</script>