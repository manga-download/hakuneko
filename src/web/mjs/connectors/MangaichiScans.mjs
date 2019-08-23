import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class MangaichiScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangaichiscans';
        super.label = 'MangaichiScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://mangaichiscans.mokkori.fr';
        this.path = '/fs/directory/';
        this.language = 'english';
    }
}