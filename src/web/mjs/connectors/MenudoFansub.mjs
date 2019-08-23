import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class MenudoFansub extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'menudofansub';
        super.label = 'MenudoFansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'http://www.menudo-fansub.com';
        this.path = '/slide/directory/';
        this.language = 'spanish';
    }
}