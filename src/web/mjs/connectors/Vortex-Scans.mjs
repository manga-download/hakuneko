import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class Vortex_Scans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'vortex-scans';
        super.label = 'Vortex-Scans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://reader.vortex-scans.com';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}