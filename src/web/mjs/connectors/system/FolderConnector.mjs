import Manga from '../../engine/Manga.mjs';
import Chapter from '../../engine/Chapter.mjs';

const statusDefinitions = {
    offline: 'offline', // chapter/manga that cannot be downloaded, but exist in manga directory
    completed: 'completed', // chapter/manga that already exist on the users device
};

/**
 * A special connector to show all mangas from a given local folder.
 * This connector does not implement the connector base class, because it operates different.
 */
export default class FolderConnector {

    // TODO: dependency injection for Engine.Settings, Engine.Storage
    constructor() {
        // Public members for usage in UI (mandatory)
        this.id = 'folder';
        this.label = ' 【Folder Viewer】';
        this.icon = '/img/connectors/' + this.id;
        this.tags = [ /* 'bookmarks', 'favorites' */ ];
        // Private members for internal usage only (convenience)
        this.url = undefined;
        // Private members for internal use that can be configured by the user through settings menu (set to undefined or false to hide from settings menu!)
        this.config = {
            path: {
                label: 'Manga Folder',
                description: [
                    `A local directory from which mangas can be shown within HakuNeko with the ${ this.label } connector`,
                    `The directory only works with top-level manga folders, nested manga folders are not supported!`,
                    `The manga folders must also contain their chapters in the top-level!`
                ].join('\n'),
                input: 'directory',
                value: '' // Engine.Settings.baseDirectory.value
            }
        };
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
        let directory = this.config.path.value;
        Engine.Storage._readDirectoryEntries( directory )
            .then( entries => {
                let mangaList = entries.map( entry => {
                // TODO: exclude files
                    let manga = new Manga( this, Engine.Storage.path.join( directory, entry ), entry, statusDefinitions.completed );
                    manga.getChapters = this.getChapters.bind( manga );
                    return manga;
                } );
                callback( null, mangaList );
            } )
            .catch( error => {
                console.error( error, this );
                callback( error, [] );
            } );
    }

    /**
     * Replacement function for manga objects, since the behavior is quite different
     * The corresponding manga is bound to 'this'
     */
    getChapters( callback ) {
        let manga = this;
        if( !( manga instanceof Manga ) ) {
            return callback( new Error( 'This method must be used from a <Manga> object\'s context!' ), [] );
        }
        Engine.Storage._readDirectoryEntries( manga.id )
            .then( entries => {
                let chapterList = entries.map( entry => {
                    let chapter = new Chapter( manga, Engine.Storage.path.join( manga.id, entry ), entry, undefined, statusDefinitions.offline );
                    chapter.getPages = manga.connector.getPages.bind( chapter );
                    return chapter;
                } );
                callback( null, chapterList );
            } )
            .catch( error => {
                console.error( error, manga );
                callback( error, [] );
            } );
    }

    /**
     *
     */
    _getChapterList( manga, callback ) {
        return callback ( new Error( 'This method cannot be called from any connector other then <Folder>!' ), [] );
    }

    /**
     * Replacement function for chapter objects, since the behavior is quite different
     * The corresponding chapter is bound to 'this'
     */
    getPages( callback ) {
        let chapter = this;
        if( !( chapter instanceof Chapter ) ) {
            return callback( new Error( 'This method must be used from a <Chapter> object\'s context!' ), [] );
        }
        Engine.Storage.loadChapterPages( chapter.id )
            .then( pages => {
                callback( null, pages );
            } )
            .catch( error => {
                console.error( error, chapter );
                callback( error, [] );
            } );
    }

    /**
     *
     */
    _getPageList( manga, chapter, callback ) {
        return callback ( new Error( 'This method cannot be called from any connector other then <Folder>!' ), [] );
    }
}