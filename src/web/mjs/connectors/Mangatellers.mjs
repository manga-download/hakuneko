import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class Mangatellers extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangatellers';
        super.label = 'Mangatellers';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://www.mangatellers.gr';
        this.path = '/reader/reader/list/';
        this.language = 'english';
    }
}