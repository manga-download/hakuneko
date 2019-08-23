import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class Biamam extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'biamam';
        super.label = 'Biamam Scans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://biamam.com';

        this.language = 'en';
    }
}