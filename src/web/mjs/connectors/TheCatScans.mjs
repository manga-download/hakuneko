import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class TheCatScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'thecatscans';
        super.label = 'TheCatScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://reader2.thecatscans.com';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}