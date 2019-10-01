import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class ElevenToon extends Connector {

    /**
     *
     */
    constructor() {
        super();
        super.id = '11toon';
        super.label = '11toon';
        this.tags = [ 'manga', 'korean' ];
        this.url = 'http://www.11toon.com';
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        index = index || 0;
        let request = new Request( mangaPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'ul.homelist li a div.homelist-title span', 5 )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element.closest( 'a' ), request.url ),
                        title: element.textContent.trim()
                    };
                } );
                if( index < mangaPageLinks.length - 1 ) {
                    return this._getMangaListFromPages( mangaPageLinks, index + 1 )
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
        let request = new Request( this.url + '/bbs/board.php?bo_table=toon_c&type=upd&page=', this.requestOptions );
        this.fetchDOM( request, 'main.main nav.pg_wrap span.pg a.pg_end' )
            .then( data => {
                let pageCount = parseInt( data[0].href.match( /\d+$/ )[0] );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => request.url + ( page + 1 ) );
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
    _getChapterListFromPages( manga, chapterPageLinks, index ) {
        index = index || 0;
        let request = new Request( chapterPageLinks[ index ], this.requestOptions );
        return this.fetchDOM( request, 'ul#comic-episode-list li button.episode', 5 )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element.getAttribute( 'onclick' ).split( '\'' )[1], request.url ),
                        title: element.querySelector( 'div.episode-title' ).textContent.replace( manga.title, '' ).trim(),
                        language: ''
                    };
                } );
                if( index < chapterPageLinks.length - 1 ) {
                    return this._getChapterListFromPages( manga, chapterPageLinks, index + 1 )
                        .then( chapters => chapterList.concat( chapters ) );
                } else {
                    return Promise.resolve( chapterList );
                }
            } );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        let uri = new URL( manga.id, this.url );
        let request = new Request( uri.href, this.requestOptions );
        this.fetchDOM( request, 'nav.pg_wrap span.pg a.pg_end' )
            .then( data => {
                let pageLinks = [ request.url ];
                if( data.length > 0 ) {
                    let pageCount = parseInt( data[0].href.match( /\d+$/ )[0] );
                    pageLinks = [... new Array( pageCount ).keys()].map( page => {
                        uri.searchParams.set( 'page', page + 1 );
                        return uri.href;
                    } );
                }
                return this._getChapterListFromPages( manga, pageLinks );
            } )
            .then( data => {
                callback( null, data );
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
        Engine.Request.fetchUI( request, `new Promise( resolve => resolve( img_list ) )` )
            .then( data => {
                callback( null, data );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}