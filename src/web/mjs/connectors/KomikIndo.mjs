import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 *
 */
export default class KomikIndo extends WordPressEManga {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'komikindo';
        super.label = 'KomikIndo';
        this.tags = [ 'manga', 'indonesian' ];
        // Private members for internal usage only (convenience)
        this.url = 'https://komikindo.co';
        this.path = '/manga-list/?list';

        this.queryChapters = 'div.bxcl ul li div.lch a';
    }
}