import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class Riceballicious extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'riceballicious';
        super.label = 'Riceballicious';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://riceballicious.info';
        this.path = '/fs/reader/list/';
        this.language = 'english';
    }
}