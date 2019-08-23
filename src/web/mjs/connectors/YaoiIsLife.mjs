import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class YaoiIsLife extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'yaoiislife';
        super.label = 'YaoiIsLife';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://yaoislife.shounen-ai.net';
        this.path = '/reader/directory/';
        this.language = 'english';
    }
}