import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class PowerManga extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'powermanga';
        super.label = 'PowerManga';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://read.powermanga.org';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}