import ReadManga from './ReadManga.mjs';

/**
 *
 */
export default class SelfManga extends ReadManga {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'selfmanga';
        super.label = 'SelfManga';
        // Private members for internal usage only (convenience)
        this.url = 'http://selfmanga.ru';

        this.preferSubtitleAsMangaTitle = false;
    }
}