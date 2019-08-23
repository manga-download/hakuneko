import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class MangaDenizi extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangadenizi';
        super.label = 'MangaDenizi';
        this.tags = [ 'manga', 'high-quality', 'turkish', 'scanlation' ];
        this.url = 'http://www.mangadenizi.com';
    }
}