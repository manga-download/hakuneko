import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class RenascenceScans extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'renascencescans';
        super.label = 'RenascenceScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://renascans.com';

        this.queryMangas = 'ul.price-list li a';
        this.queryChapters = 'ul.chapters li h3.chapter-title-rtl';
        this.language = 'en';
    }
}