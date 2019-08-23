import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class NeuManga extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'neumanga';
        super.label = 'NeuManga';
        this.tags = [ 'manga', 'indonesian' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://neumanga.tv';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url + '/manga?mode=text', 'div.spl div.alplist li a.mg' )
            .then( data => {
                let mangaList = data.map( element => {
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
        this.fetchDOM( this.url + manga.id, 'div.chapter div.item div.item-content a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ) + '/_/1',
                        title: element.querySelector( 'h3' ).textContent.replace( manga.title, '' ).replace( /^\s*-\s*/, '' ).trim(),
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
        this.fetchDOM( this.url + chapter.id, 'div.readarea source.imagechap' )
            .then( data => {
                let pageList = data.map( element => element.dataset['src'] );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}