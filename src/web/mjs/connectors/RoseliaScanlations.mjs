import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class RoseliaScanlations extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'roseliascanlations';
        super.label = 'RoseliaScanlations';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://reader.roseliascans.com';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}