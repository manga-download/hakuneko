import ReaderFront from './templates/ReaderFront.mjs';

/**
 *
 */
export default class RavensScansES extends ReaderFront {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'ravensscans-es';
        super.label = 'RavensScans (Spanish)';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://ravens-scans.com';
        this.baseURL = 'https://api.ravens-scans.com';
        this.language = 'es';
    }
}