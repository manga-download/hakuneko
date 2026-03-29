import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class PatyScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'patyscans';
        super.label = 'PatyScans';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'http://lector.patyscans.com';
        //this.path        = '/directory/';
        this.language = 'spanish';
    }
}