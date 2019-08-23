import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class RawSenManga extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'rawsenmanga';
        super.label = 'RawSenManga';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://raw.senmanga.com';
        this.requestOptions.headers.set( 'x-cookie', 'viewer=1' );
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    _getMangaList( callback ) {
        fetch( this.url + '/directory/text_version', this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive manga list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let dom = this.createDOM( data );
                let mangaList = [...dom.querySelectorAll( 'div.list table tr td.series_title a' )].map( element => {
                    return {
                        id: this.getRelativeLink( element ),
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
        fetch( this.url + manga.id, this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive chapter list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let dom = this.createDOM( data );
                let chapterList = [...dom.querySelectorAll( 'div.list div.element div.title a' )].map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.trim(),
                        language: 'jp'
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
                let pageList = [];
                let match = undefined;
                let regex = new RegExp( /{\s*url\s*:\s*"(http.*?)"\s*}/g );
                while( match = regex.exec( data ) ) {
                    pageList.push( match[1] );
                }
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}