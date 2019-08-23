import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

/**
 *
 */
export default class WoweScans extends MangaReaderCMS {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'wowescans';
        super.label = 'Wowe Scans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://wowescans.net';

        this.language = 'en';
    }
}