import Connector from '../engine/Connector.mjs';

/**
 * @author Neogeek
 * Affiliates: MangaKakalot, MangaBat (prev. MangaSupa), MangaIro
 */
export default class MangaNel extends Connector {

    constructor() {
        super();
        super.id = 'manganel';
        super.label = 'MangaNelo';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manganelo.com';

        this.path = '/manga_list?type=new&category=all&alpha=all&state=all&group=all&page=';
        this.queryMangasPageCount = 'div.group_page a.page_last:last-of-type';
        this.queryMangas = 'div.truyen-list h3 a';
        this.queryChapters = 'div.chapter-list div.row span a';
        this.queryPages = 'div#vungdoc source, div.vung-doc source, div.vung_doc source';
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
                    this.cfMailDecrypt( element );
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim()
                    };
                } ).filter(manga => manga.id.startsWith('/'));
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
        this.fetchDOM( this.url + this.path + '1', this.queryMangasPageCount )
            .then( data => {
                let pageCount = parseInt( data[0].href.match( /\d+$/ ) );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + this.path + ( page + 1 ) );
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
        // is this a cross reference from any of MangaNel's descandants (e.g. MangaKakalot) to MangaNel?
        let uri = new URL( manga.id, this.url ).href; // ( manga.id.startsWith( 'http' ) ? '' : this.url ) + manga.id;
        fetch( uri, this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive page (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let redirect = data.match( /window.location.assign\(\s*"([^"]+)"\s*\)/ );
                return this.fetchDOM( redirect && !redirect[1].includes('manganel') ? redirect[1] : uri, this.queryChapters );
            } )
            .then( data => {
                let chapterList = data.map( element => {
                    this.cfMailDecrypt( element );
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim(),
                        language: 'en'
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
        // is this a cross reference from any of MangaNel's descandants (e.g. MangaKakalot) to MangaNel?
        let uri = new URL( chapter.id, this.url ).href; // ( chapter.id.startsWith( 'http' ) ? '' : this.url ) + chapter.id;
        this.fetchDOM( uri, this.queryPages )
            .then( data => {
                let pageList = data.map( element => element.src );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}