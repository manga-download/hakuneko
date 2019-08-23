import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class DokiFansubs extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'dokifansubs';
        super.label = 'DokiFansubs';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://kobato.hologfx.com';
        this.path = '/reader/directory/';
        this.language = 'english';
    }
}