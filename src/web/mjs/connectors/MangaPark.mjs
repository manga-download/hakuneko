import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaPark extends Connector {

    constructor() {
        super();
        super.id = 'mangapark';
        super.label = 'MangaPark (2018)';
        this.tags = [ 'manga', 'multi-lingual' ];
        this.url = 'https://mangapark.org';
        this.requestOptions.headers.set( 'x-cookie', 'h=1' );
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.container div.mt-4 h3 a', 3);
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'div#browse h6 a', 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    this.cfMailDecrypt( element );
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
        this.fetchDOM( this.url + '/browse', 'nav.d-md-block ul.pagination li:nth-last-child(2) a' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/browse?page=' + ( page + 1 ) );
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
        fetch( this.url + manga.id, this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive chapter list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let chapterList = [];
                let dom = this.createDOM( data );
                dom.querySelectorAll( 'div.card' ).forEach ( card => {
                    let info = card.querySelector( 'div.card-header a.ml-1' ).text;
                    let locale = info.match( /\[(.*?)\]/ )[1];
                    let source = info.match( /\[.*?\]\s*(.*)$/ )[1];
                    let chapters = [...card.querySelectorAll( 'div.card-body ul li div:first-of-type a.ml-2' )].map( element => {
                        let title = element.text.replace( manga.title, '' ).trim() + ` (${locale}) [${source}]`;
                        // remove last path element => show all images on single page
                        element.href = element.href.replace( /\/[^/]*$/, '' );
                        return {
                            id: this.getRelativeLink( element ),
                            title: title,
                            language: locale
                        };
                    } );
                    chapterList = chapterList.concat( chapters );
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
        fetch( this.url + chapter.id, this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive page list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let pages = data.match( /_load_pages\s*=\s*(\[.*?\])\s*;/ ) || data.match( /images\s*=\s*(\[.*?\])\s*;/ );
                let pageList = JSON.parse( pages[1] ).map( page => page['u'] ? page.u : page );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}