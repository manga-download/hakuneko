import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class RawMangaUpdate extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'rawmangaupdate';
        super.label = 'RawMangaUpdate';
        this.tags = [ 'manga', 'high-quality', 'chinese', 'scanlation' ];
        this.url = 'http://rawmangaupdate.com';

        this.queryChapters = 'ul.chapters li h5.chapter-title-rtl a';
        this.language = 'zh';
    }
}