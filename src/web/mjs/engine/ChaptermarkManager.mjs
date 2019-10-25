const events = {
    changed: 'changed'
};

export default class ChaptermarkManager extends EventTarget {

    // TODO: use dependency injection instead of globals for Engine.Storage
    constructor(settings) {
        super();
        this.chaptermarks = [];
        this._settings = settings;

        this._settings.addEventListener('saved', this._onSettingsChanged.bind(this));
    }

    _onSettingsChanged() {
        // TODO: only save chaptermarks if the bookmark directory has changed
        this._syncChaptermarks(undefined);
    }

    /**
     *
     */
    mergeChaptermarks( chaptermarks ) {
        if( !chaptermarks ) {
            return;
        }

        let marks = chaptermarks.filter( c => this._findIndex( c ) < 0 );
        this.chaptermarks = this.chaptermarks.concat( marks );
        this._syncChaptermarks( undefined );
    }

    /**
     *
     */
    _findIndex( chaptermark ) {
        return this.chaptermarks.findIndex( c => c.connectorID === chaptermark.connectorID && c.mangaID === chaptermark.mangaID );
    }

    /**
     * Try to save the current chaptermarks.
     * Will reset chaptermarks when saving fails.
     */
    _syncChaptermarks( callback ) {
        Engine.Storage.saveBookmarks( 'chaptermarks', this.chaptermarks, 2 )
            .then( () => {
                this.dispatchEvent( new CustomEvent( events.changed, { detail: this.chaptermarks } ) );
                if( typeof callback === typeof Function ) {
                    callback( null );
                }
            } )
            .catch( () => {
                this.loadChaptermarks( callback );
            } );
    }

    _getChapterIdentifier( chapter ) {
        // some chapters are using objects as ID, these will provide a hash as identifier
        return chapter.id.hash || chapter.id ;
    }

    isChapterMarked( chapter, mark ) {
        return mark
            && chapter
            && (mark.chapterID === this._getChapterIdentifier(chapter) || mark.chapterID === chapter.file.full)
            && mark.mangaID === chapter.manga.id
            && mark.connectorID === chapter.manga.connector.id;
    }

    /**
     *
     */
    loadChaptermarks( callback ) {
        Engine.Storage.loadBookmarks( 'chaptermarks' )
            .then( data => {
                try {
                    if( !data ) {
                        throw new Error( 'Invalid chaptermark list!' );
                    }
                    this.chaptermarks = data;
                    this.dispatchEvent( new CustomEvent( events.changed, { detail: this.chaptermarks } ) );
                    if( typeof callback === typeof Function ) {
                        callback( null );
                    }
                } catch( e ) {
                    console.error( 'Failed to load chaptermarks:', e.message );
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

    /**
     * Get the chapter mark for the given manga (or undefined if no chapter is marked for the manga)
     */
    getChaptermark( manga ) {
        let chaptermark = undefined;
        if( manga ) {
            chaptermark = this.chaptermarks.find( mark => {
                return mark.mangaID === manga.id && mark.connectorID === manga.connector.id ;
            } );
            // backward compatibility (old chaptermarks don't have a title)
            if( chaptermark ) {
                chaptermark['chapterTitle'] = chaptermark['chapterTitle'] || 'Chapter Title Unavailable';
            }
        }
        return chaptermark;
    }

    /**
     * Mark the given chapter (replace any existing marked chapter for this connector/manga)
     */
    addChaptermark( chapter ) {
        if( !chapter || !chapter.manga || !chapter.manga.connector ) {
            return;
        }
        let chaptermark = {
            connectorID: chapter.manga.connector.id,
            mangaID: chapter.manga.id,
            chapterID: this._getChapterIdentifier( chapter ),
            chapterTitle: chapter.title
        };
        let index = this._findIndex( chaptermark );
        if( this._findIndex( chaptermark ) > -1 ) {
            this.chaptermarks[index] = chaptermark;
        } else {
            this.chaptermarks.push( chaptermark );
            //this.dispatchEvent( new CustomEvent( this.eventAdded, { detail: chaptermark } ) );
        }
        this._syncChaptermarks();
    }

    /**
     *
     */
    deleteChaptermark( chaptermark ) {
        let index = this._findIndex( chaptermark );
        if( index > -1 ) {
            this.chaptermarks.splice( index, 1 );
            //this.dispatchEvent( new CustomEvent( this.eventRemoved, { detail: chaptermark } ) );
            this._syncChaptermarks();
        }
    }
}