import ReadManga from './ReadManga.mjs';

/**
 *
 */
export default class MintManga extends ReadManga {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'mintmanga';
        super.label = 'MintManga';
        // Private members for internal usage only (convenience)
        this.url = 'http://mintmanga.com';

        this.preferSubtitleAsMangaTitle = true;
    }
}