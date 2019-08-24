import InvalidConnector from './InvalidConnector.mjs';
import Manga from '../../engine/Manga.mjs';

/**
 * System
 * A special connector to show all bookmarked mangas from various connectors.
 * This connector does not implement the connector base class, because it operates different.
 */
export default class BookmarkConnector {

    constructor() {
        // Public members for usage in UI (mandatory)
        this.id = 'bookmarks';
        this.label = ' 【Bookmarks】';
        this.icon = '/img/connectors/' + this.id;
        this.tags = [ /* 'bookmarks', 'favorites' */ ];
        this.isLocked = false;
        // Private members for internal usage only (convenience)
        this.url = undefined;
        this.referer = undefined;
        this.agent = undefined;
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = undefined;
    }

    /**
     *
     */
    _getConnectorByID( id ) {
        return Engine.Connectors.find( connector => {
            return connector.id === id ;
        } ) || new InvalidConnector( id, `${id} (unavailable)` );
    }

    /**
     *
     */
    updateMangas( callback ) {
        this._getMangaList( callback );
    }

    /**
     *
     */
    getMangas( callback ) {
        this._getMangaList( callback );
    }

    /**
     *
     */
    _getMangaList( callback ) {
        /*
         * get mangas and check status
         * use a different approach to determine existence of manga, since it can be expected that
         * the bookmark list is way shorter than a manga list of a connector => no performance issues expected
         */
        let mangas = Engine.BookmarkManager.bookmarks.map( bookmark => {
            let manga = new Manga( this._getConnectorByID( bookmark.key.connector ), bookmark.key.manga, bookmark.title.manga );
            // determine if manga directory exist on disk
            Engine.Storage.mangaDirectoryExist( manga )
                .then( () => {
                // set existing manga list for related connector (used by manga.updateStatus function)
                    manga.connector.existingMangas[ Engine.Storage.sanatizePath ( manga.title ) ] = true;
                    manga.updateStatus();
                } )
                .catch( () => { /* directory for bookmark does not yet exist */ } );
            return manga;
        });
        mangas.sort( ( a, b ) => {
            return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1 ;
        });
        callback( null, mangas );
    }
}