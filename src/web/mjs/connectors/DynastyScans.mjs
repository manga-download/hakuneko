import Connector from '../engine/Connector.mjs';

/**
 * @author Neogeek
 */
export default class DynastyScans extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'dynasty-scans';
        super.label = 'DynastyScans';
        this.tags = [ 'manga', 'english' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://dynasty-scans.com';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    _getMangaList( callback ) {
        let promises = ['/series', '/anthologies', '/issues', '/doujins'].map( page => {
            return this.fetchDOM( this.url + page, '.tag-list dd a' )
                .then( data => {
                    let mangaList = data.map( element => {
                        return {
                            id: this.getRelativeLink( element ),
                            title: element.text.trim()
                        };
                    } );
                    return Promise.resolve( mangaList );
                } );
        } );

        Promise.all( promises )
            .then( mangas => {
                callback( null, [].concat( ... mangas ) );
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
        this.fetchDOM( this.url + manga.id, '.chapter-list dd a[class="name"]' )
            .then( data => {
                let chapterList = data.map( element => {
                    let title = element.text.replace( manga.title, '' ).trim();
                    return {
                        id: this.getRelativeLink( element ),
                        title: ( title === '' ? manga.title : title ),
                        language: 'en'
                    };
                } );
                // rename duplicate chapters, using a stack to count preceding chapters with the same name
                let titleStack = [];
                for( let chapter of chapterList ) {
                    // do not change the command order!
                    let duplicateCount = titleStack.filter( t => t === chapter.title ).length;
                    titleStack.push( chapter.title );
                    chapter.title += ( duplicateCount > 0 ? ' #' + duplicateCount : '' );
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
        fetch( this.url + chapter.id, this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( `Failed to receive page list (status: ${response.status}) - ${response.statusText}` );
                }
                return response.text();
            } )
            .then( data => {
                let pages = data.match( /var\s+pages\s*=\s*(\[.*?\])\s*;/ )[1];
                let pageList = JSON.parse( pages ).map( p => this.url + p.image );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}