import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaParkEN extends Connector {

    constructor() {
        super();
        super.id = 'mangapark-en';
        super.label = 'MangaPark';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangapark.net';
        this.requestOptions.headers.set( 'x-cookie', 'set=h=1;' );
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'section.manga div.container div.mb-2 h2 a', 3);
        let id = uri.pathname + uri.search;
        let title = data[0].innerText.replace(/manga/i, '').trim();
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
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'div.manga-list div.item table tr td h2 a', 5 ) )
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
        this.fetchDOM( this.url + '/search?orderby=a-z', 'div.manga-list ul.paging li:nth-last-child(3) a' )
            .then( data => {
                let pageCount = parseInt( data[0].href.match( /page=(\d+)/ )[1] );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/search?orderby=a-z&page=' + ( page + 1 ) );
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
                dom.querySelectorAll( 'div#list div.stream' ).forEach ( card => {
                    let info = card.querySelector( 'div.cate a span' ).innerText.trim();
                    let chapters = [...card.querySelectorAll( 'div.volume ul.chapter li' )].map( element => {
                        let number = element.querySelector( 'div.tit' );
                        number = number ? number.innerText.trim() : '';
                        let title = element.querySelector( 'div.txt' );
                        title = title ? title.innerText.trim() : '';
                        let seperator = number && title ? ' ' : '';
                        element = element.querySelector( 'div.tit a.ch' );
                        // remove last path element => show all images on single page
                        element.href = element.href.replace( /\/[^/]*$/, '' );
                        return {
                            id: this.getRelativeLink( element ),
                            title: number + seperator + title + ` [${info}]`,
                            language: 'en'
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