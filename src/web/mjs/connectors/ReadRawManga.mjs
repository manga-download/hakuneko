import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class ReadRawManga extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'readrawmanga';
        super.label = 'Manhua RAW (ReadRawManga)';
        this.tags = [ 'manga', 'raw', 'multi-lingual' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'http://www.readrawmanga.com';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url + '/', 'div.sidebar div#Label1 div.list-label-widget-content ul li a' )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, this.url ),
                        title: element.text.trim()
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
        let uri = new URL( manga.id, this.url );
        uri.searchParams.set( 'max-results', 999 );
        this.fetchDOM( uri.href, 'div#main div#Blog1 div.post article h2.post-title a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRootRelativeOrAbsoluteLink( element, uri.href ),
                        title: element.text.replace( manga.title, '' ).replace( /\(\s*read raw manhua\s*\)/i, '' ).trim(),
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
        this.fetchDOM( this.url + chapter.id, 'div#main div#Blog1 article div.post-body source' )
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