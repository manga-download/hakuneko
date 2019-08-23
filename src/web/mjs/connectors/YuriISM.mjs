import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class YuriISM extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'yuriism';
        super.label = 'YuriISM';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://www.yuri-ism.net';
        this.path = '/slide/directory/';
        this.language = 'english';
    }
}