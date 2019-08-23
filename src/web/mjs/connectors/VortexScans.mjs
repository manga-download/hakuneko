import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class VortexScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'vortexscans';
        super.label = 'VortexScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://reader.vortex-scans.com';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}