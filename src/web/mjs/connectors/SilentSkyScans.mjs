import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class SilentSkyScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'silentskyscans';
        super.label = 'SilentSkyScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://reader.silentsky-scans.net';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}