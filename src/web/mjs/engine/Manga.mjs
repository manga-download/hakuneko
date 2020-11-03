import Chapter from './Chapter.mjs';

const events = {
    updated: 'updated'
};

const extensions = {
    m3u8: '.m3u8',
    mkv:  '.mkv',
    mp4:  '.mp4'
};

const statusDefinitions = {
    offline: 'offline', // chapter/manga that cannot be downloaded, but exist in manga directory
    available: 'available', // chapter/manga that can be added to the download list
    completed: 'completed', // chapter/manga that already exist on the users device
};

export default class Manga extends EventTarget {

    // TODO: use dependency injection instead of globals for Engine.Settings, Engine.Storage, all Enums
    constructor( connector, id, title, status ) {
        super();
        this.connector = connector;
        this.id = id;
        this.title = title;
        this.status = status;
        this.chapterCache = [];
        this.existingChapters = [];

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
            this.dispatchEvent( new CustomEvent( events.updated, { detail: this } ) );
            document.dispatchEvent( new CustomEvent( EventListener.onMangaStatusChanged, { detail: this } ) );
        }
    }

    /**
     *
     */
    updateStatus() {
        // look in the connector's list of existing mangas (found in directory), if this manga already exist
        if( !this.connector || !this.connector.existingMangas ) {
            return;
        }
        let sanatizedTitle = Engine.Storage.sanatizePath ( this.title );
        if( this.connector.existingMangas[sanatizedTitle] ) {
            this.setStatus( statusDefinitions.completed );
        } else {
            this.setStatus( statusDefinitions.available );
        }
    }

    isChapterFileExisting( chapter ) {
        if( !this.existingChapters ) {
            return false;
        }
        return this.existingChapters[chapter.file.full]
            || this.existingChapters[chapter.file.name + extensions.mp4]
            || this.existingChapters[chapter.file.name + extensions.mkv]
            || this.existingChapters[chapter.file.name + extensions.m3u8];
    }

    isChapterFileCached( fileName ) {
        // use !! to convert result to bool
        return !!this.chapterCache.find( chapter => {
            return fileName === chapter.file.full
                || fileName === chapter.file.name + extensions.mp4
                || fileName === chapter.file.name + extensions.mkv
                || fileName === chapter.file.name + extensions.m3u8;
        } );
    }

    /**
     * Get all chapters for the manga.
     * Callback will be executed after completion and provided with a reference to the chapter list (empty on error).
     */
    getChapters( callback ) {
        // find all chapter titles (sanitized) that are found in the directory for this manga
        Engine.Storage.getExistingChapterTitles( this )
            .catch( () => {
                // Ignore chapter file reading errors (e.g. manga directory not exist yet)
                return Promise.resolve( [] );
            } )
            .then( existingChapterTitles => {
                this.existingChapters = existingChapterTitles;
                // check if chapter list is cached and has access to online chapters
                let onlineChapters = chapter => chapter.status === statusDefinitions.completed || chapter.status === statusDefinitions.available;
                return this.chapterCache && this.chapterCache.some(onlineChapters) ? this._getUpdatedChaptersFromCache() : this._getUpdatedChaptersFromWebsite();
            } )
            .then( () => {
                for( let existingChapterTitle in this.existingChapters ) {
                    if( !this.isChapterFileCached( existingChapterTitle ) ) {
                        this.chapterCache.push( new Chapter( this, existingChapterTitle, existingChapterTitle, undefined, statusDefinitions.offline ) );
                    }
                }
                callback( null, this.chapterCache );
            } )
            .catch( error => {
                // TODO: remove log ... ?
                console.warn( 'getChapters', error );
                return callback( error, this.chapterCache );
            } );
    }

    /**
     *
     */
    _getUpdatedChaptersFromCache() {
        if( this.chapterCache ) {
            this.chapterCache.forEach( chapter => {
                chapter.updateStatus();
            } );
        }
        return Promise.resolve( this.chapterCache );
    }

    /**
     *
     */
    _getUpdatedChaptersFromWebsite() {
        return this.connector.initialize()
            .then( () => {
                return new Promise( ( resolve, reject ) => {
                    this.connector._getChapterList( this, ( error, chapters ) => {
                        if( error ) {
                            reject( error );
                        } else {
                            resolve( chapters );
                        }
                    } );
                } );
            } )
            .then( chapters => {
                let chapterFormat = Engine.Settings.chapterTitleFormat.value;
                // de-serialize chapters into objects
                this.chapterCache = chapters.map( chapter => {
                    return new Chapter( this, chapter.id, this.formatChapterTitle( chapter.title, chapterFormat ), chapter.language );
                } );
                return Promise.resolve( this.chapterCache );
            } )
            .catch( error => {
                // TODO: remove log ... ?
                console.warn( '_getUpdatedChaptersFromWebsite', error );
                return Promise.resolve( this.chapterCache || [] );
            } );
    }

    /**
     *
     */
    formatChapterTitle( title, format ) {
        //
        let result = format;
        // do not extract volume/chapter
        if( result === '' ) {
            return title;
        }

        let name = title;
        let reVol = /\s*(?:vol\.?|volume|tome)\s*(\d+)/i;
        let reCh = /\s*(?:^|ch\.?|ep\.?|chapter|chapitre|episode|#)\s*([\d.?\-?v?]+)(?:\s|:|$)+/i; // $ not working in character groups => [\s\:$]+ does not work

        // extract volume number
        let volume = name.match( reVol );
        if( volume && volume.length > 1 ) {
            volume = volume[1] ? volume[1] : '';
        } else {
            volume = '';
        }
        name = name.replace( reVol, '' ).trim();
        volume = this._padNumberPrefixWithZeros( volume, 3 );

        // extract chapter number
        let chapter = name.match( reCh );
        if( chapter && chapter.length > 1 ) {
            chapter = chapter[1] ? chapter[1] : '';
        } else {
            chapter = '';
        }
        name = name.replace( reCh, '' ).trim();
        chapter = this._padNumberPrefixWithZeros( chapter, 4 );

        // apply extracted parts to format from user settings
        result = result.replace( /%VOL%/i, volume ); // volume number replacement
        result = result.replace( /%CH%/i, chapter ); // chapter number replacement
        result = result.replace( /%T%/i, name ); // clean title replacement
        result = result.replace( /%O%/i, title ); // original title replacement
        result = result.replace( /%M%/i, this.title ); // original title replacement
        result = result.replace( /%C%/i, this.connector.label ); // original title replacement

        return result;
    }

    /**
     * Prepend the given text with zeros until the
     */
    _padNumberPrefixWithZeros( text, digits ) {
        let prefix = text.toString().match( /^\d+/ );
        let count = prefix && prefix.length > 0 ? prefix[0].length : 0;
        count = Math.min( digits, count );
        return '0'.repeat( digits - count ) + text;
    }
}