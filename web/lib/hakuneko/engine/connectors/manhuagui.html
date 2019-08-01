<link rel="import" href="../connector.html">

<script>

    /**
     *
     */
    class ManHuaGui extends Connector {

        /**
         *
         */
        constructor() {
            super();
            super.id         = 'manhuagui';
            super.label      = 'ManHuaGui';
            this.tags        = [ 'manga', 'chinese' ];
            this.url         = 'https://www.manhuagui.com';
            this.requestOptions.headers.set( 'x-referer', this.url );
        }

        /**
         * 
         */
        _getMangaFromURI( uri ) {
            return this.fetchDOM( uri.href, 'div.book-cont div.book-detail div.book-title h1', 3 )
            .then( data => {
                let id = uri.pathname + uri.search;
                let title = data[0].innerText.trim();
                return Promise.resolve( new Manga( this, id, title ) );
            } );
        }

        /**
         * Parameters mangalist and page should never be used by external calls.
         */
        _getMangaList( callback, mangaList, page ) {
            let request = new Request( 'http://cdn.hakuneko.download/' + this.id + '/mangas.json', this.requestOptions );
            this.fetchJSON( request )
            .then( data => {
                callback( null, data );
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
            this.fetchDOM( request, 'div.chapter div.chapter-list ul li a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                        title: element.title.replace( manga.title, '' ).trim(),
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
            let script = `
                new Promise( ( resolve, reject ) => {
                    setTimeout( () => { reject( new Error( 'Failed to get page links!' ) ) }, 5000 );
                    SMH.imgData = function(data) {
                        let origin = 'https://' + servs[pVars.curServ].hosts[pVars.curHost].h + '.hamreus.com';
                        let pageLinks = data.files.map( file => origin + data.path + file + '?cid=' + data.cid + '&md5=' + data.sl.md5 );
                        return { preInit: () => resolve( pageLinks ) };
                    };
                    let script = [...document.querySelectorAll('script:not([src])')].find(script => script.text.trim().startsWith('window[')).text;
                    eval( script );
                } );
            `;
            let request = new Request( this.url + chapter.id, this.requestOptions );
            Engine.Request.fetchUI( request, script )
            .then( data => {
                let pageList = data.map( page => this.createConnectorURI( page ) );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
        }
    }

</script>