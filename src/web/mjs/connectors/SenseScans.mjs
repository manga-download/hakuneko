import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class SenseScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'sensescans';
        super.label = 'SenseScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://reader.sensescans.com';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}