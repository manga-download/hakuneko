export default class Enums {

    /**
     * Enumeration of available input types for editing values.
     */
    static get Input() {
        return {
            text:      Symbol( 'text' ),
            password:  Symbol( 'password' ),
            numeric:   Symbol( 'number' ),
            select:    Symbol( 'select' ),
            checkbox:  Symbol( 'checkbox' ),
            file:      Symbol( 'file' ),
            directory: Symbol( 'directory' )
        }
    }

    static get EpisodeFormat() {
        return {
            m3u8: '.m3u8',
            mkv:  '.mkv',
            mp4:  '.mp4'
        }
    }

    static get ChapterFormat() {
        return {
            img:  'img',  // images within a folder
            cbz:  '.cbz', // comic book archive extension
            pdf:  '.pdf', // portable document format extension
            epub: '.epub' // e-book reader format extension
        }
    }

    static get HistoryFormat() {
        return {
            none: '',
            json: '.json',
            csv:  '.csv'
        }
    }

    /**
     * Enumeration of available stauses used at various places.
     * Must be strings, because those are directly used as CSS classes in the UI.
     */
    static get DownloadStatus() {
        return {
            unavailable: 'unavailable', // chapter/manga that cannot be downloaded
            offline:     'offline',     // chapter/manga that cannot be downloaded, but exist in manga directory
            available:   'available',   // chapter/manga that can be added to the download list
            queued:      'queued',      // chapter/manga that is queued for download to the users device
            downloading: 'downloading', // chapter/manga that is currently downloaded to the users device
            completed:   'completed',   // chapter/manga that already exist on the users device
            failed:      'failed'       // chapter/manga that failed to be downloaded
        }
    }

    /**
     * Enumeration of available UI event listeners that can be used to register/dispatch events in document.
     */
    static get EventListener() {
        return {
            onSettingsChanged:        'onSettingsChanged',       // ...
            onBookmarksChanged:       'onBookmarksChanged',      // ...
            onChaptermarksChanged:    'onChaptermarksChanged',   // ...
            onMangaStatusChanged:     'onMangaStatusChanged',    // ...
            onChapterStatusChanged:   'onChapterStatusChanged',  // ...
            onDownloadStatusUpdated:  'onDownloadStatusUpdated', // ...
            onRequestChapterUp:       'onRequestChapterUp',      // ...
            onRequestChapterDown:     'onRequestChapterDown'     // ...
        }
    }
}