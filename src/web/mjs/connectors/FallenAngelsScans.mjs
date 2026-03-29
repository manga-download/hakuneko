import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class FallenAngelsScans extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'fallenangelsscans';
        super.label = 'FallenAngelsScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://manga.fascans.com';

        this.language = 'en';
    }
}