import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class KissComic extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'kisscomic';
        super.label = 'KissComic (ReadComicOnline)';
        this.tags = [ 'comic', 'english' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://readcomiconline.to';
        this.pageLoadDelay = 5000;
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     * Parameters mangalist and page should never be used by external calls.
     */
    _getMangaList( callback ) {
        fetch( 'http://cdn.hakuneko.download/' + this.id + '/mangas.json', this.requestOptions )
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
        this.fetchDOM( this.url + manga.id, 'div.episodeList table.listing tr td:first-of-type a, div.section ul.list li a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( /read online/i, '' ).replace( manga.title, '' ).trim(),
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
        if( this.isLocked ) {
            console.warn( `[WARN: ${this.label}, too many requests]` );
            callback( new Error( 'Request to ' + this.label + ' has been skipped to prevent the client from beeing blocked for to many requests!' ), [] );
            return;
        }
        let key = this.lock();
        setTimeout( () => {
            this.unlock( key );
        }, this.pageLoadDelay );

        let uri = new URL( chapter.id, this.url );
        uri.searchParams.set('quality', 'hq');
        let request = new Request( uri.href, this.requestOptions );
        Engine.Request.fetchUI( request, 'lstImages' )
            .then( data => {
                let pageList = data.map( link => new URL( link, this.url ).href );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}