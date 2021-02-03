export default class Enums {

    /**
     * Enumeration of available UI event listeners that can be used to register/dispatch events in document.
     */
    static get EventListener() {
        return {
            onMangaStatusChanged:     'onMangaStatusChanged', // ...
            onChapterStatusChanged:   'onChapterStatusChanged', // ...
            onSelectChapter:          'onSelectChapter',
            onSelectConnector:        'onSelectConnector',
            onSelectManga:            'onSelectManga'
        };
    }

    static get NovelColorProfiles() {
        return Engine._settings.NovelColorProfile.options.find(ele => ele.value.toLowerCase() == Engine._settings.NovelColorProfile.value.toLowerCase()).val;
    }
}