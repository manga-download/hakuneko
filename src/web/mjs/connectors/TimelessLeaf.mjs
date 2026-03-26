import Connector from '../engine/Connector.mjs';

/**
 *
 */
export default class TimelessLeaf extends Connector {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'timelessleaf';
        super.label = 'TimelessLeaf';
        this.tags = [ 'manga', 'english' ];
        super.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = 'https://timelessleaf.com';
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    _getMangaList( callback ) {
        this.fetchDOM( this.url + '/manga/', 'nav#site-navigation ul#primary-menu li.current-menu-item li:not(.menu-item-has-children) a' )
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
        this.fetchDOM( this.url + manga.id, 'div.entry-content > p > a' )
            .then( data => {
                let chapterList = data.map( element => {
                    return {
                        id: this.getRelativeLink( element ),
                        title: element.text.replace( manga.title, '' ).trim(),
                        language: 'en'
                    };
                } );
                /*
                 * Some chapters may be links to an external chapter list
                 * e.g. https://timelessleaf.com/lan-chi-2/
                 * has an entry 'Chapter 1-62', which redirects to
                 * https://mangasoul.com/manga/24
                 */
                callback( null, chapterList.filter( chapter => chapter.id.startsWith( '/' ) ) );
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
        // view-source:https://timelessleaf.com/index.php/2018/02/07/lan-chi-chapter-63-1/ srcset, only https://timelessleaf.com seems working
        this.fetchDOM( this.url + chapter.id, 'div.entry-content source' )
            .then( data => {
                let pageList = data.map( element => {
                    if( element['srcset'] ) {
                        let host = new URL( this.url ).hostname;
                        let source = element.srcset.split( ',' )
                            // split into links and resolution
                            .map( src => src.trim().split( ' ' ) )
                            // sort descending (higher resolution first)
                            .sort( ( a, b ) => parseInt( a[1] ) < parseInt( b[1] ) )
                            // find the first image that is hosted on this domain
                            .find( src => src[0].includes( host ) || src[0].startsWith( '/' ) );
                        if( source ) {
                            return source[0];
                        }
                    }
                    return element.src;
                } );
                callback( null, pageList );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, undefined );
            } );
    }
}