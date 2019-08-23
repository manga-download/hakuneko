import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class ShoujoSense extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'shoujosense';
        super.label = 'ShoujoSense';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://reader.shoujosense.com';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}