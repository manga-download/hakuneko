import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class StormInHeaven extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'storminheaven';
        super.label = 'Storm in Heaven';
        this.tags = [ 'manga', 'high-quality', 'italian', 'scanlation' ];
        this.url = 'https://www.storm-in-heaven.net';
        this.path = '/reader-sih/directory/';
        this.language = 'italian';
    }
}