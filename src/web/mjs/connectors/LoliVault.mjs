import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class LoliVault extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'lolivault';
        super.label = 'LoliVault';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://lolivault.net';
        this.path = '/online/directory/';
        this.language = 'spanish';
    }
}