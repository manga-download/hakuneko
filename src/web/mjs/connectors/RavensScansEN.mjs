import ReaderFront from './templates/ReaderFront.mjs';

/**
 *
 */
export default class RavensScansEN extends ReaderFront {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'ravensscans-en';
        super.label = 'RavensScans (English)';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://ravens-scans.com';
        this.baseURL = 'https://api.ravens-scans.com';
        this.language = 'en';
    }
}