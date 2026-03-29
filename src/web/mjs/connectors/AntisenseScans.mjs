import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class AntisenseScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'antisensescans';
        super.label = 'AntisenseScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://antisensescans.com';
        this.path = '/online/directory/';
        this.language = 'english';
    }
}