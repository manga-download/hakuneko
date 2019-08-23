import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class AnataNoMotokare extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'anatanomotokare';
        super.label = 'Anata no Motokare';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://motokare.xyz';
        this.path = '/reader/directory/';
        this.language = 'english';
    }
}