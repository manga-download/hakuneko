export default class Enums {

    /**
     * Enumeration of available UI event listeners that can be used to register/dispatch events in document.
     */
    static get EventListener() {
        return {
            onSettingsSaved:        'onSettingsSaved', // ...
            onMangaStatusChanged:     'onMangaStatusChanged', // ...
            onChapterStatusChanged:   'onChapterStatusChanged', // ...
        };
    }
}