import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class EvilFlowers extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'evilflowers';
        super.label = 'EvilFlowers';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://reader.evilflowers.com';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}