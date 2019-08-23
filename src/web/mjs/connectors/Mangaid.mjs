import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 *
 */
export default class Mangaid extends WordPressEManga {

    /**
     *
     */
    constructor() {
        super();
        // Public members for usage in UI (mandatory)
        super.id = 'mangaid';
        super.label = 'Mangaid';
        this.tags = [ 'manga', 'indonesian' ];
        // Private members for internal usage only (convenience)
        this.url = 'https://mangaid.me';
        this.path = '/daftar-manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
        this.queryPages = 'div#readerarea > :not(.kln) source[src]:not([src=""])';
    }
}