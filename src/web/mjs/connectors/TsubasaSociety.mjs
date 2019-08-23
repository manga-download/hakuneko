import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class TsubasaSociety extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'tsubasasociety';
        super.label = 'Tsubasa Society';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://www.tsubasasociety.com';
        this.path = '/reader/master/Xreader/directory/';
        this.language = 'english';
    }
}