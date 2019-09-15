export default class Enums {

    /**
     * Enumeration of available stauses used at various places.
     * Must be strings, because those are directly used as CSS classes in the UI.
     */
    static get DownloadStatus() {
        return {
            unavailable: 'unavailable', // chapter/manga that cannot be downloaded
            offline:     'offline', // chapter/manga that cannot be downloaded, but exist in manga directory
            available:   'available', // chapter/manga that can be added to the download list
            queued:      'queued', // chapter/manga that is queued for download to the users device
            downloading: 'downloading', // chapter/manga that is currently downloaded to the users device
            completed:   'completed', // chapter/manga that already exist on the users device
            failed:      'failed' // chapter/manga that failed to be downloaded
        };
    }

    /**
     * Enumeration of available UI event listeners that can be used to register/dispatch events in document.
     */
    static get EventListener() {
        return {
            onSettingsChanged:        'onSettingsChanged', // ...
            onMangaStatusChanged:     'onMangaStatusChanged', // ...
            onChapterStatusChanged:   'onChapterStatusChanged', // ...
        };
    }
}