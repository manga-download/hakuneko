import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class XAnimeSeduccion extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'xanimeseduccion';
        super.label = 'XAnimeSeduccion';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'http://xanime-seduccion.com';
        //this.path        = '/directory/';
        this.language = 'spanish';
    }
}