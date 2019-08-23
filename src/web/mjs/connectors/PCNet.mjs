import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class PCNet extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'pcnet';
        super.label = 'PCNet';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'http://pcnet.patyscans.com';
        //this.path        = '/directory/';
        this.language = 'spanish';
    }
}