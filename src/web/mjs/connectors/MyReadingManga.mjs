import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class MyReadingManga extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'myreadingmanga';
        super.label = 'MyReadingManga';
        this.tags = [ 'manga', 'english' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://myreadingmanga.info';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    _getMangaListFromPages( mangaPageLinks, index ) {
        if( index === undefined ) {
            index = 0;
        }
        return this.wait( 0 )
            .then ( () => this.fetchDOM( mangaPageLinks[ index ], 'header.entry-header h2.entry-title a.entry-title-link', 5 ) )
            .then( data => {
                let mangaList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( /^\s*\[.*?\]\s*/g, '' )
                        //title: element.text.replace( /^\s*\[.*?\]\s*|\s*\[.*?\]\s*$/g, '' )
                    };
                } );
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
        this.fetchDOM( this.url, 'div.pagination ul li:nth-last-child(2) a' )
            .then( data => {
                let pageCount = parseInt( data[0].text.trim() );
                let pageLinks = [... new Array( pageCount ).keys()].map( page => this.url + '/page/' + ( page + 1 ) + '/' );
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
        this.fetchDOM( this.url + manga.id, 'div.chapter-class p a' )
            .then( data => {
                let chapterList = [
                    {
                        id: manga.id,
                        title: manga.title,
                        language: ''
                    }
                ];
                if( data.length > 0 ) {
                    chapterList = data.map( element => {
                        return {
                            id: this.getRelativeLink( element ),
                            title: element.text.trim(),
                            language: ''
                        };
                    } );
                }
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
        this.fetchDOM( this.url + chapter.id, 'div.entry-content source' )
            .then( data => {
                let pageLinks = data.map( element => element.dataset['src'] || element.dataset['lazySrc'] ); // data-lazy-src
                callback( null, pageLinks );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}