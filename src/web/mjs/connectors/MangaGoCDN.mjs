import Connector from '../engine/Connector.mjs';
import MangaGo from './MangaGo.mjs';

/**
 *
 */
export default class MangaGoCDN extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'mangago-cdn';
        super.label = 'MangaGo (CDN)';
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'http://mangago.hakuneko.download/cdn';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    _getMangaList( callback ) {
        fetch( this.url + '/mangas.json', this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive manga list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.json();
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
        fetch( this.url + manga.id.replace( '/read-manga', '' ) + '/chapters.json', this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive chapter list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.json();
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
        fetch( this.url + manga.id.replace( '/read-manga', '' ) + '/' + chapter.id + '.json', this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive page list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.json();
            } )
            .then( data => {
                // use the mangago protocol for images (=> de-scramble images with mangago connector)
                let mangago = Engine.Connectors.find( connector => connector instanceof MangaGo );
                let pages = data.map( page => {
                    let uri = new URL( page );
                    uri.protocol = mangago.id;
                    return uri.href;
                } );
                callback( null, pages );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}