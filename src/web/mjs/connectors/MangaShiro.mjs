import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 *
 */
export default class MangaShiro extends WordPressEManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangashiro';
        super.label = 'MangaShiro';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangashiro.org';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
        this.queryPages = 'div#readerarea > :not(.kln) source[src]:not([src=""])';
    }
}