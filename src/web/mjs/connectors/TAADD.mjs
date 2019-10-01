import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class TAADD extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'taadd';
        super.label = 'TAADD';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.taadd.com';

        //this.queryMangasPageCount = '';
        this.pageCount = 950;
        this.queryMangas = 'div.clistChr ul li div.intro h2 a';
        this.queryChapters = 'div.chapter_list table tr td:first-of-type a';
        this.queryPages = 'select#page option';
        this.queryImages = 'source#comicpic';
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
                        title: element.title.trim() || element.text.trim()
                    };
                } );
                if( mangaList.length > 0 && index < mangaPageLinks.length - 1 ) {
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
        return Promise.resolve( this.pageCount )
            .then( pageCount => {
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/search/?completed_series=either&page=' + ( page + 1 ) );
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
        let uri = new URL( this.url + manga.id );
        if( this.id === 'taadd' || this.id === 'tenmanga' || this.id.startsWith( 'ninemanga' ) ) {
            uri.searchParams.append( 'warning', '1' );
            // fix query parameter typo for ninemanga
            uri.searchParams.append( 'waring', '1' );
        }
        this.fetchDOM( uri.href, this.queryChapters )
            .then( data => {
                let chapterList = data.map( element => {
                    this.cfMailDecrypt( element );
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( manga.title, '' ).replace( /\s*new$/, '' ).trim(),
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
        this.fetchDOM( request, this.queryPages )
            .then( data => {
                let pageList = data.map( element => this.createConnectorURI( this.getAbsolutePath( element.value, request.url ) ) );
                callback( null, [...new Set( pageList )] );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _handleConnectorURI( payload ) {
        let request = new Request( payload, this.requestOptions );
        return this.fetchDOM( request, this.queryImages )
            .then( data => super._handleConnectorURI( data[0].src ) );
    }
}