import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MerakiScans extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'merakiscans';
        super.label = 'MerakiScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://merakiscans.com';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url + '/manga/', 'div#content div#all div#listitem a' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.querySelector( 'h1' ).textContent.trim()
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
        this.fetchDOM( this.url + manga.id, 'table#chapter_table tbody tr#chapter-head' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: element.dataset['href'],
                        title: element.querySelector( 'td#chapter-part' ).textContent.trim(),
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
        fetch( this.url + chapter.id, this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive page list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let pages = data.match( /var\s+images\s*=\s*(\[.*?\])\s*;/ )[1];
                let pageList = JSON.parse( pages ).map( p => this.url + chapter.id + p );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}