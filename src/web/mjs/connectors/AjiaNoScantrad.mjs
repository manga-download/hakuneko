import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class AjiaNoScantrad extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'ajianoscantrad';
        super.label = 'Ajia no Scantrad';
        this.tags = [ 'manga', 'high-quality', 'french', 'scanlation' ];
        this.url = 'https://ajianoscantrad.fr';
        this.path = '/reader/directory/';
        this.language = 'french';
    }
}