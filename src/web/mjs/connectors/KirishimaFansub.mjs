import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class KirishimaFansub extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'kirishimafansub';
        super.label = 'KirishimaFansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'http://lector.kirishimafansub.net';
        //this.path        = '/directory/';
        this.language = 'spanish';
    }
}