import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class MangaVadisi extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangavadisi';
        super.label = 'MangaVadisi';
        this.tags = [ 'manga', 'high-quality', 'turkish', 'scanlation' ];
        this.url = 'http://manga-v2.mangavadisi.org';
    }
}