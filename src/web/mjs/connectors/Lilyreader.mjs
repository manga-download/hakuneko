import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class Lilyreader extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'lilyreader';
        super.label = 'Lilyreader';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://manga.smuglo.li';
        this.path = '/directory/';
        this.language = 'english';
    }
}