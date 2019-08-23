import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 *
 */
export default class Kiryuu extends WordPressEManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'kiryuu';
        super.label = 'Kiryuu';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://kiryuu.co';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
        this.queryPages = 'div#readerarea > :not(.kln) source[src]:not([src=""])';
    }
}