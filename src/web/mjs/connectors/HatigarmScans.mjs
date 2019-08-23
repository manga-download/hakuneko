import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class HatigarmScans extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'hatigarmscans';
        super.label = 'Hatigarm Scans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://www.hatigarmscans.net';

        this.language = 'en';
    }
}