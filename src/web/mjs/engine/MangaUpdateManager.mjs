import Bookmark from './Bookmark.mjs';
import Manga from './Manga.mjs';
import InvalidConnector from '../connectors/system/InvalidConnector.mjs';

const events = {
    // added: 'added',
    // removed: 'removed',
    changed: 'changed',
    progress: 'progress'
};

export default class MangaUpdateManager extends EventTarget {

    // TODO: use dependency injection instead of globals for Engine.Connetors, Engine.Storage
    constructor(settings, downloadManager, connectors, storage, bookmarkManager) {
        super();
        this.isUpdating = false;
        this.ignoreUpdateMangas = []; // list of bookmarks for updating mangas
        this._updateMangasList = null; // list of Manga objects (will be created from updateMangas)
        this._settings = settings;
        this._downloadManager = downloadManager;
        this._connectors = connectors;
        this._storage = storage;
        this._bookmarkManager = bookmarkManager;

        this._settings.addEventListener('saved', this._onSettingsChanged.bind(this));
    }

    _onSettingsChanged() {
        // TODO: only save update-chapter if the bookmark directory has changed
        this._syncIgnoreUpdateMangas(() => this.dispatchEvent( new CustomEvent( events.changed, { detail: this.ignoreUpdateMangas } ) ));
    }

    /**
     *
     */
    _findIgnoreIndex( bookmarkOrManga ) {
        if( bookmarkOrManga.key && bookmarkOrManga.key.manga && bookmarkOrManga.key.connector ) {
            return this.ignoreUpdateMangas.findIndex( bookmark => bookmark.key.manga === bookmarkOrManga.key.manga && bookmark.key.connector === bookmarkOrManga.key.connector );
        }
        return this.ignoreUpdateMangas.findIndex( bookmark => bookmark.key.manga === bookmarkOrManga.id && bookmark.key.connector === bookmarkOrManga.connector.id );
    }

    /**
     * Try to save the current update-chpaters.
     * Will reset update-mangas when saving fails.
     */
    _syncIgnoreUpdateMangas( callback ) {
        this._storage.saveBookmarks( 'ignoreupdates', this.ignoreUpdateMangas, 2 )
            .then( () => {
                this._updateMangasList = null;
                // this.dispatchEvent( new CustomEvent( events.changed, { detail: this.ignoreUpdateMangas } ) );
                if( typeof callback === typeof Function ) {
                    callback( null );
                }
            } )
            .catch( () => {
                this.loadIgnoreUpdateMangas( callback );
            } );
    }

    /**
     *
     */
    loadIgnoreUpdateMangas( callback ) {
        this._storage.loadBookmarks( 'ignoreupdates' )
            .then( data => {
                try {
                    if( !data ) {
                        throw new Error( 'Invalid updateManga list!' );
                    }
                    this.ignoreUpdateMangas = data;
                    this._updateMangasList = null;
                    this.dispatchEvent( new CustomEvent( events.changed, { detail: this.ignoreUpdateMangas } ) );
                    if( typeof callback === typeof Function ) {
                        callback( null );
                    }
                } catch( e ) {
                    console.error( 'Failed to load updateMangas:', e.message );
                    if( typeof callback === typeof Function ) {
                        callback( e );
                    }
                }
            } )
            .catch( error => {
                if( typeof callback === typeof Function ) {
                    callback( error );
                }
            } );
    }

    async _loadUpdateMangasList() {
        return new Promise( (resolve, reject) => {
            this._getMangaList( (error, mangas) => {
                if(error) {
                    return reject(error);
                }
                if(!mangas || mangas.length === 0) {
                    return reject(new Error('Failed updating all mangas: could not find any manga for updating'));
                }
                this._updateMangasList = mangas;
                return resolve();
            } );
        } );
    }

    /**
     *
     */
    _getConnectorByID( id ) {
        return this._connectors.list.find( connector => {
            return connector.id === id;
        } ) || new InvalidConnector( id, `${id} (unavailable)` );
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
        let mangas = this._bookmarkManager.bookmarks.filter(bookmark => {
          let index = this._findIgnoreIndex(bookmark);
          return index > -1 ? false : true;
        }).map( bookmark => {
            let manga = new Manga( this._getConnectorByID( bookmark.key.connector ), bookmark.key.manga, bookmark.title.manga );
            // determine if manga directory exist on disk
            this._storage.mangaDirectoryExist( manga )
                .then( () => {
                // set existing manga list for related connector (used by manga.updateStatus function)
                    manga.connector.existingMangas[ this._storage.sanatizePath ( manga.title ) ] = true;
                    manga.updateStatus();
                } )
                .catch( () => { /* directory for bookmark does not yet exist */ } );
            return manga;
        });
        mangas.sort( ( a, b ) => {
            return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
        });
        callback( null, mangas );
    }

    /**
     *
     */
    isIgnoreUpdateManga( manga ) {
      return this._findIgnoreIndex(manga) > -1;
    }

    /**
     *
     */
    addIgnoreUpdateManga( manga ) {
        if( !manga || ! manga.connector ) {
            return false;
        }
        let index = this._findIgnoreIndex( manga );
        if( index < 0 ) {
            let bookmark = new Bookmark( manga );
            this.ignoreUpdateMangas.push( bookmark );
            this.ignoreUpdateMangas.sort( this.compareIgnoreUpdateMangas );
            this._syncIgnoreUpdateMangas( undefined );
            this.dispatchEvent( new CustomEvent( events.changed, { detail: [bookmark] } ) );
            // this.dispatchEvent( new CustomEvent( events.added, { detail: bookmark } ) );
            return true;
        }
        return false;
    }

    /**
     *
     */
    deleteIgnoreUpdateManga( bookmarkOrManga ) {
        let index = this._findIgnoreIndex( bookmarkOrManga );
        if( index > -1 ) {
            let bookmark = this.ignoreUpdateMangas[index];
            this.ignoreUpdateMangas.splice( index, 1 );
            this._syncIgnoreUpdateMangas( undefined );
            this.dispatchEvent( new CustomEvent( events.changed, { detail: [bookmark] } ) );
            // this.dispatchEvent( new CustomEvent( events.removed, { detail: bookmarkOrManga } ) );
            return true;
        }
        return false;
    }

    /**
     * Helper function for sorting
     */
    compareIgnoreUpdateMangas( a, b ) {
        return a.title.manga.toLowerCase() < b.title.manga.toLowerCase() ? -1 : 1;
    }

    async updateAllMangas() {

        this.isUpdating = true;

        if(!this._updateMangasList) {
            return this._loadUpdateMangasList()
                .then(() => this.updateAllMangas())
                .catch(error => {
                    console.error('Error while updating Mangas: Failed loading manga list for updates', error);

                    this.isUpdating = false;
                    this.dispatchEvent( new CustomEvent( events.progress, { detail: {
                        state: 'error',
                        complete: true,
                    } } ) );
                } );
        }

        this._canceled = false;

        this.dispatchEvent( new CustomEvent( events.progress, { detail: {
            state: 'start',
            complete: false,
        } } ) );

        try {

            let finished = [];
            let getFinishedIndex = (theManga) => finished.findIndex( bookmark => bookmark.key.manga === theManga.id && bookmark.key.connector === theManga.connector.id );

            for ( let i = 0; i < this._updateMangasList.length; ++i ) {
                if( this._canceled ) {
                    this.isUpdating = false;
                    this.dispatchEvent( new CustomEvent( events.progress, { detail: {
                        state: 'cancled',
                        complete: true,
                    } } ) );
                    return;
                }
                let manga = this._updateMangasList[i];

                this.dispatchEvent( new CustomEvent( events.progress, { detail: {
                    state: 'step',
                    current: i + 1,
                    total: this._updateMangasList.length,
                    // item: manga,
                    mangaTitle: manga.title,
                    connectorTitle: manga.connector.label,
                    complete: false,
                } } ) );

                try {

                    await this._updateChapters( manga );

                    let index = getFinishedIndex( manga );
                    if(index === -1){
                      finished.push( new Bookmark(manga) );
                    }

                } catch( error ) {

                    console.error('Error while updating Mangas: Failed to update manga ', manga, error);

                    this.dispatchEvent( new CustomEvent( events.progress, { detail: {
                        state: 'error',
                        current: i + 1,
                        total: this._updateMangasList? this._updateMangasList.length : 0,
                        // item: manga,
                        mangaTitle: manga.title,
                        connectorTitle: manga.connector.label,
                        complete: false,
                    } } ) );
                }

                try {

                    if( ! this._updateMangasList) {
                        // list might have been changed / reset while processing the current manga's new chapters:
                        // -> reload manga-list, if cached list was reset
                        await this._loadUpdateMangasList();

                        // restore finished/unfinished status in manga list:
                        // (1) do sort according to already finished status:
                        this._updateMangasList.sort( ( a, b ) => {
                            let finA = getFinishedIndex( a );
                            let finB = getFinishedIndex( b );
                            if ( finA === -1 && finB !== -1){
                                return 1;
                            } else if ( finA !== -1 && finB === -1){
                                return -1;
                            }
                            return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
                        });
                        // (2) find last finished index for continuing update process:
                        for(let j=0, size = this._updateMangasList.length; i < size; ++j){
                            let curr = this._updateMangasList[j];
                            let finCurr = getFinishedIndex( curr );
                            if(finCurr === -1){
                                i = j - 1;
                                break;
                            }
                        }
                    }

                } catch( error ) {

                    console.error('Error while updating Mangas: Failed loading manga list for updates', error);

                    this.isUpdating = false;
                    this.dispatchEvent( new CustomEvent( events.progress, { detail: {
                        state: 'error',
                        complete: true,
                    } } ) );

                    return; // EARLY EXIT //
                }

            }

            this.isUpdating = false;
            this.dispatchEvent( new CustomEvent( events.progress, { detail: {
                state: 'finished',
                complete: true,
            } } ) );

        } catch( error ) {

            // "catch all" to ensure isUpdating is always set correctly

            console.error('Error while updating Mangas: Unexpected error occurred while updating new chapters', error);

            this.isUpdating = false;
            this.dispatchEvent( new CustomEvent( events.progress, { detail: {
                state: 'error',
                complete: true,
            } } ) );

            return; // EARLY EXIT //
        }
    }

    _updateChapters( manga ) {

        if( this._canceled ) {
            return Promise.resolve();
        }

        return new Promise( (resolve, reject) => manga.getChapters( ( error, chapters ) => {

            if ( error ) {
                console.error('Error while updating Mangas: Failed to get chapters for manga ' + manga.title + '(' + manga.connector.label + ')', error);
                return reject(error);
            }

            if( this._canceled ) {
                return resolve();
            }

            for ( let i = 0, size = chapters.length; i < size; ++i ) {

                if( this._canceled ) {
                    return resolve();
                }

                // console.log('  processing chapter "'+chapters[i].title+'"['+chapters[i].status+'] (['+chapters[i].manga.connector.label+'].'+chapters[i].manga.title+') for update...');
                this._enqueueOrIgnoreChapter( chapters[i] );
            }

            resolve();
        } ) );

    }

    _enqueueOrIgnoreChapter( chapter ) {
        switch ( chapter.status ) {
            case 'failed': // intentional fallthrough
            case 'available':
                this._downloadManager.addDownload( chapter );
                return true;

            // ignore chapters if status is:
            case 'unavailable': // intentional fallthrough
            case 'offline': // intentional fallthrough
            case 'completed': // intentional fallthrough
            default:
                return false;
        }
    }

    cancelUpdate() {
        this._canceled = true;
        this.isUpdating = false;
    }
}
