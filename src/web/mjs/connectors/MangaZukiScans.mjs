import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class MangaZukiScans extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangazuki-scans';
        super.label = 'Mangazuki Scans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://mangazuki.co';

        this.queryMangas = 'ul.price-list li a';
        this.queryChapters = 'ul.chapters li h3.chapter-title-rtl a';
        this.language = 'en';
    }
}