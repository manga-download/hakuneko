import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

/**
 *
 */
export default class MangaDex extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'mangadex';
        super.label = 'MangaDex';
        this.tags = [ 'manga', 'high-quality', 'multi-lingual' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://mangadex.org';
        this.requestOptions.headers.set( 'x-cookie', 'mangadex_h_toggle=1; mangadex_title_mode=2' );
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may ban your IP for to many consecuitive requests.',
                input: 'numeric',
                min: 1000,
                max: 5000,
                value: 2500
            }
        };
    }

    /**
     * Overwrite base function to get manga from clipboard link.
     */
    _getMangaFromURI( uri ) {
        return this.fetchDOM( uri.href, 'div.card h6.card-header span.mx-1', 3 )
            .then( data => {
                let id = uri.pathname.match( /\/(\d+)\/?/ )[1];
                let title = data[0].innerText.trim();
                return Promise.resolve( new Manga( this, id, title ) );
            } );
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( this.config.throttle.value )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'div.manga-entry div.row div.text-truncate a.manga_title', 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    this.cfMailDecrypt( element );
                    return {
                        id: element.href.match( /\/(\d+)\// )[1],
                        title: element.text.trim()
                    };
                } );
                if( !mangaList.length ) {
                    console.warn( this.label, '=> No mangas found on pagination', mangaPageLinks[ index ] );
                }
                if( mangaList.length && index < mangaPageLinks.length - 1 ) {
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
        /*
         * NOTES:
         * The first title page(s) do not contain a link to the last page, just to page 28
         * Sometimes the pagination bar is completely missing e.g. when directly accessing page 250 or 500
         * => scrape pages until mangas are no more found
         */

        /*
         * https://mangadex.org/api/v1/mangas/all
         * https://github.com/xicelord/mangadex-api/blob/master/handlers/mangas_handler.js
         */
        this.fetchDOM( this.url + '/titles/2/250', 'nav ul.pagination li.page-link:last-of-type a.page-link' )
            .then( data => {
                let pageCount = !data.length ? 999 : parseInt( data[0].href.match( /(\d+)\/$/)[1] );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/titles/2/' + ( page + 1 ) + '/' );
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
        this._requestAPI( this.url + '/api/manga/' + this._migratedMangaID( manga.id ), this.requestOptions, 'chapter' )
            .then( data => {
                let chapterList = Object.keys( data.chapter ).map( id => {
                    let chapter = data.chapter[id];
                    let title = '';
                    if( chapter.volume ) { // => string, not a number
                        title += 'Vol.' + this._padNum( chapter.volume, 2 );
                    }
                    if( chapter.chapter ) { // => string, not a number
                        title += ' Ch.' + this._padNum( chapter.chapter, 4 );
                    }
                    if( chapter.title ) {
                        title += ( title ? ' - ' : '' ) + chapter.title;
                    }
                    if( chapter.lang_code ) {
                        title += ' (' + chapter.lang_code + ')';
                    }
                    if( chapter.group_name ) {
                        title += ' [' + chapter.group_name + ']';
                    }
                    return {
                        id: id,
                        title: title.trim(),
                        language: chapter.lang_code
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
        this._requestAPI( this.url + '/api/chapter/' + chapter.id, this.requestOptions, 'page' )
            .then( data => {
                let baseURL = ( data.server.startsWith( '/' ) ? this.url : '' ) + data.server + data.hash + '/';
                let pageList = data.page_array.map( page => baseURL + page );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }

    /**
     *
     */
    _requestAPI( url, requestOptions, label ) {
        return fetch( url, requestOptions )
            .then( response => {
                if( response.status !== 200 && response.status !== 409 ) {
                    throw new Error( `Failed to receive ${label} list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.json();
            } )
            .then( data => {
                if( data.status.toLowerCase() !== 'ok' ) {
                    let message = data.status === 'external' ? 'External reference: ' + data.external : data[ 'message' ] || 'No information available' ;
                    throw new Error( `Failed to receive ${label} list (status: ${data.status})\n${message}` );
                }
                return Promise.resolve( data );
            } );
    }

    /**
     *
     */
    _padNum( number, places ) {
        /*
         * '17'
         * '17.5'
         * '17-17.5'
         * '17 - 17.5'
         * '17-123456789'
         */
        let range = number.split( '-' );
        range = range.map( chapter => {
            chapter = chapter.trim();
            let digits = chapter.split( '.' )[0].length;
            return '0'.repeat( Math.max( 0, places - digits ) ) + chapter;
        } );
        return range.join( '-' );
    }

    /**
     * Try to convert old manga IDs to the latest version (e.g. when stored as bookmark).
     */
    _migratedMangaID( mangaID ) {
        // /manga/8466/darwin-s-game
        let v1 = mangaID.match( /^\/manga\/(\d+)\/.*$/ );
        if( v1 ) {
            return v1[1];
        }
        let v2 = mangaID.match( /^\d+$/ );
        if( v2 ) {
            return v2[0];
        }
        return mangaID;
    }
}