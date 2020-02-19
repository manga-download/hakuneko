import Connector from '../../engine/Connector.mjs';

export default class FoolSlide extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.url = undefined;

        this.path = '/directory/';

        this.defaultPageCount = 1; // pages when no link was found
        this.queryMangasPageCount = 'div.prevnext div.next a:first-of-type';
        this.queryMangas = 'div.list div.group > div.title a';
        this.queryChapters = 'div.list div.element div.title a';
        //this.queryPages = '';
        this.language = '';
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], this.queryMangas, 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this._getMangaListFromPages( mangaPageLinks, index + 1 )
                        .then( mangas => mangas.concat( mangaList ) );
                } else {
                    return Promise.resolve( mangaList );
                }
            } );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url + this.path, this.queryMangasPageCount )
            .then( data => {
                let pageCount = data.length === 0 ? this.defaultPageCount : parseInt( data[0].href.match(/(\d+)\/$/)[1] ) ;
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + this.path + ( page + 1 ) + '/' );
                return this._getMangaListFromPages( pageLinks );
            } )
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
        this.requestOptions.method = 'POST';
        this.requestOptions.headers.set( 'content-type', 'application/x-www-form-urlencoded' );
        this.requestOptions.body = 'adult=true';
        return this.fetchDOM( this.url + manga.id, this.queryChapters )
            .then( data => {
                this.requestOptions.method = 'GET';
                this.requestOptions.headers.delete( 'content-type' );
                this.requestOptions.body = undefined;
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim(),
                        language: this.language
                    };
                } );
                callback( null, chapterList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, undefined );
            } );
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let response = await fetch(request);
        let data = await response.text();
        let pages = undefined;
        let pagesRAW = data.match(/pages\s*=\s*(\[.*?\])\s*;/);
        if(pagesRAW instanceof Array) {
            pages = pagesRAW[1];
        }
        let pagesB64 = data.match(/pages\s*=\s*JSON.parse\s*\(\s*atob\s*\("(.*?)"\s*\)\s*\)\s*;/);
        if( pagesB64 instanceof Array ) {
            pages = atob(pagesB64[1]);
        }
        if(!pages) {
            throw new Error(`Failed to extract page list!`);
        }
        return JSON.parse(pages).map(page => this.getAbsolutePath(page.url, request.url));
    }
}