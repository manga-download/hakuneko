import Bookmark from './Bookmark.mjs'

export default class BookmarkManager {

    // TODO: use dependency injection instead of globals for Engine.Connetors, Engine.Storage
    constructor() {
        this.bookmarks = [];
    }

    /**
     *
     */
    mergeBookmarks( bookmarks ) {
        if( !bookmarks ) {
            return;
        }
        let added = '';
        let exists = '';
        let dropped = '';
        bookmarks.forEach( bookmark => {
            // check if connector / website is supported
            let supported = Engine.Connectors.findIndex( c => ( c.id === bookmark.key.connector ) ) > -1;
            if( !supported ) {
                dropped += `<tr><td style="color: #808080; font-weight: bold; padding-right: 1em;">${ bookmark.title.connector }</td><td>${ bookmark.title.manga }</td></tr>`;
            }
            // check if bookmark does not exist
            let exist = this.bookmarks.findIndex( b => ( bookmark.key.manga === b.key.manga && bookmark.key.connector === b.key.connector ) ) > -1;
            if( exist ) {
                exists += `<tr><td style="color: #808080; font-weight: bold; padding-right: 1em;">${ bookmark.title.connector }</td><td>${ bookmark.title.manga }</td></tr>`;
            }
            // is supported and can be added
            if( supported && !exist ) {
                added += `<tr><td style="color: #808080; font-weight: bold; padding-right: 1em;">${ bookmark.title.connector }</td><td>${ bookmark.title.manga }</td></tr>`;
                this.bookmarks.push( bookmark );
            }
        } );
        this.bookmarks.sort( this.compareBookmarks );
        this.saveProfile( 'default', undefined );
        this._showMergeResults( dropped, exists, added );
    }

    /**
     *
     */
    _showMergeResults( droppedHTML, existsHTML, addedHTML ) {
        let content = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body>
            <h1>Bookmark Import Results</h1>
            <!--
            <ul>
                <li><a target="_self" href="#dropped" title="List of all bookmarks that were not imported, because the website is not yet supported by HakuNeko.">Unsupported Bookmarks</a></li>
                <li><a target="_self" href="#exists" title="List of all bookmarks that were not imported, because the bookmarks already exists.">Existing Bookmarks</a></li>
                <li><a target="_self" href="#added" title="List of all bookmarks that were imported successfully.">Imported Bookmarks</a></li>
            </ul>
            -->
            <table style="font-family: monospace;">
                <tbody style="color: red;">
                <tr>
                    <th colspan="2" style="font-size: 1.5em; font-weight: bold; text-align: left; padding-top: 1em;">
                        <hr><a name="dropped">UNSUPPORTED BOOKMARKS</a>
                    </th>
                </tr>
                <tr>
                    <th colspan="2" style="font-family: initial; text-align: left; padding-bottom: 1.5em;">
                        List of all bookmarks that were not imported, because the websites are not yet supported by HakuNeko.<hr>
                    </th>
                </tr>
                ${ droppedHTML }
                </tbody>
                <tbody style="color: blue;">
                <tr>
                    <th colspan="2" style="font-size: 1.5em; font-weight: bold; text-align: left; padding-top: 1em;">
                        <hr><a name="exists">EXISTING BOOKMARKS</a>
                    </th>
                </tr>
                <tr>
                    <th colspan="2" style="font-family: initial; text-align: left; padding-bottom: 1.5em;">
                        List of all bookmarks that were not imported, because the bookmarks already exists in HakuNeko.<hr>
                    </th>
                </tr>
                ${ existsHTML }
                </tbody>
                <tbody style="color: green;">
                <tr>
                    <th colspan="2" style="font-size: 1.5em; font-weight: bold; text-align: left; padding-top: 1em;">
                        <hr><a name="added">ADDED BOOKMARKS</a>
                    </th>
                </tr>
                <tr>
                    <th colspan="2" style="font-family: initial; text-align: left; padding-bottom: 1.5em;">
                        List of all bookmarks that were imported successfully.<hr>
                    </th>
                </tr>
                ${ addedHTML }
                </tbody>
            </table>
        </body>
        </html>`;
        let dataURL = 'data:text/html;utf8,' + encodeURIComponent(content);
        window.open( dataURL, '_blank', 'title=Boommark Import Results,center=true,width=800,height=600' );
    }

    /**
     * Load and apply the bookmarks from the given profile.
     * Callback will be executed after the data has been loaded.
     * Callback will be provided with an error (or null if no error).
     */
    loadProfile( profile, callback ) {
        Engine.Storage.loadConfig( 'bookmarks' )
        .then( data => {
            try {
                if( !data || !data.length || data.length === 0 ) {
                    throw new Error( 'Invalid bookmark list!' );
                }
                this.bookmarks = data;
                this.bookmarks.sort( this.compareBookmarks );
                document.dispatchEvent( new CustomEvent( EventListener.onBookmarksChanged, { detail: this.bookmarks } ) );
                if( typeof( callback ) === typeof( Function ) ) {
                    callback( null );
                }
            } catch( e ) {
                console.error( 'Failed to load bookmarks:', e.message );
                if( typeof( callback ) === typeof( Function ) ) {
                    callback( e );
                }
            }
        } )
        .catch( error => {
            if( typeof( callback ) === typeof( Function ) ) {
                callback( error );
            }
        } );
    }

    /**
     * Save the current bookmarks for the given profile.
     * Callback will be executed after the data has been saved.
     * Callback will be provided with an error (or null if no error).
     */
    saveProfile( profile, callback ) {
        Engine.Storage.saveConfig( 'bookmarks', this.bookmarks, 2 )
        .then( () => {
            document.dispatchEvent( new CustomEvent( EventListener.onBookmarksChanged, { detail: this.bookmarks } ) );
            if( typeof( callback ) === typeof( Function ) ) {
                callback( null );
            }
        } )
        .catch( error => {
            console.error( 'Failed to save bookmarks:', error.message );
            if( typeof( callback ) === typeof( Function ) ) {
                callback( error );
            }
        } );
    }

    /**
     *
     */
    addBookmark( manga ) {
        if( !manga || ! manga.connector ) {
            return false;
        }
        let index = this.bookmarks.findIndex( ( bookmark ) => {
            return ( bookmark.key.manga === manga.id && bookmark.key.connector === manga.connector.id );
        });
        if( index < 0 ) {
            this.bookmarks.push( new Bookmark( manga ) );
            this.bookmarks.sort( this.compareBookmarks );
            this.saveProfile( 'default', undefined );
            return true;
        }
        return false;
    }

    /**
     *
     */
    deleteBookmark( bookmark ) {
        let index = this.bookmarks.findIndex( ( b ) => {
            return ( b.key.manga === bookmark.key.manga && b.key.connector === bookmark.key.connector );
        });
        if( index > -1 ) {
            this.bookmarks.splice( index, 1 );
            this.saveProfile( 'default', undefined );
            return true;
        }
        return false;
    }

    /**
     * Helper function for sorting
     */
    compareBookmarks( a, b ) {
        return ( a.title.manga.toLowerCase() < b.title.manga.toLowerCase() ? -1 : 1 );
    }
}