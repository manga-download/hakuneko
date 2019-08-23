import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class S2Scans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 's2scans';
        super.label = 'S2Scans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://reader.s2smanga.com';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}