export default class Enums {

    /**
     * Enumeration of available UI event listeners that can be used to register/dispatch events in document.
     */
    static get EventListener() {
        return {
            onMangaStatusChanged:     'onMangaStatusChanged', // ...
            onChapterStatusChanged:   'onChapterStatusChanged', // ...
        };
    }
}