import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class MangaZukiRAWS extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangazuki-raws';
        super.label = 'Mangazuki RAWS';
        this.tags = [ 'manga', 'high-quality', 'korean', 'scanlation' ];
        this.url = 'https://raws.mangazuki.co';

        this.queryMangas = 'ul.price-list li a';
        this.queryChapters = 'ul.chapters li h3.chapter-title-rtl a';
        this.language = 'kr';
    }
}