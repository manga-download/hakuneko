import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class KomikGue extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'komikgue';
        super.label = 'KomikGue';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://www.komikgue.com';

        this.queryChapters = 'div.chapter-wrapper table td.chapter a';
        this.language = 'id';
    }
}