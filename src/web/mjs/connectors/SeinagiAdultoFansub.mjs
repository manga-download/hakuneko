import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class SeinagiAdultoFansub extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'seinagiadultofansub';
        super.label = 'SeinagiAdultoFansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://adulto.seinagi.org';
        //this.path        = '/directory/';
        this.language = 'spanish';
    }
}