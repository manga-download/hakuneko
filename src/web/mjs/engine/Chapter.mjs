export default class Chapter {

    // TODO: use dependency injection instead of globals for Engine.Settings, Engine.Storage, all Enums
    constructor( manga, id, title, language, status ) {
        this.manga = manga;
        this.id = id;
        this.title = title;
        this.file = ( status === DownloadStatus.offline ? this._getRawFileName( title ) : this._getSanatizedFileName( title ) );
        this.language = language;
        this.status = status;
        this.pageProcess = false;
        this.pageCache = undefined;

        if( !this.status ) {
            this.updateStatus();
        }
    }

    /**
     *
     */
    setStatus( status ) {
        if( this.status !== status ) {
            this.status = status;
            document.dispatchEvent( new CustomEvent( EventListener.onChapterStatusChanged, { detail: this } ) );
        }
    }

    /**
     *
     */
    _getRawFileName( title ) {
        return {
            name: title,
            extension: '',
            full: title
        };
    }

    /**
     *
     */
    _getSanatizedFileName( title ) {
        let name = Engine.Storage.sanatizePath( title );
        let extension = Engine.Settings.chapterFormat.value !== ChapterFormat.img ? Engine.Settings.chapterFormat.value : '';
        return {
            name: name,
            extension: extension,
            full: name + extension
        };
    }

    /**
     *
     */
    updateStatus() {
        // do not overwrite download status ...
        if( !this.status || this.status === DownloadStatus.available || this.status === DownloadStatus.completed ) {
            if( !this.manga ) {
                return;
            }
            if( this.manga.isChapterFileExisting( this ) ) {
                this.setStatus( DownloadStatus.completed );
            } else {
                this.setStatus( DownloadStatus.available );
            }
        }
    }

    /**
     * Get all pages for the chapter.
     * Callback will be executed after completion and provided with an error (or null when no error occured)
     * and a reference to the page list (undefined on error).
     */
    getPages( callback ) {
        if( this.status === DownloadStatus.offline || this.status === DownloadStatus.completed ) {
            Engine.Storage.loadChapterPages( this )
                .then( pages => {
                    callback( null, pages );
                } )
                .catch( error => {
                    console.error( error, this );
                    callback( error, undefined );
                } );
        } else {
            // check if page list is cached
            if( this.pageCache && this.pageCache.length ) {
                callback( null, this.pageCache );
                return;
            }
            this.manga.connector.initialize()
                .then( () => {
                // get page list directly from the connector interface and cache them
                    this.manga.connector._getPageList( this.manga, this, ( error, pages ) => {
                        this.pageCache = [];
                        if( !error ) {
                            this.pageCache = pages;
                        }
                        callback( error, this.pageCache );
                    } );
                } )
                .catch( error => {
                    callback( error, undefined );
                } );
        }
    }
}