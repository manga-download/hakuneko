import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class OneTimeScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'onetimescans';
        super.label = 'OneTimeScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://reader.otscans.com';
        this.path = '/directory/';
        this.language = 'english';
    }
}