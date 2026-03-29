import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class ShoujoHearts extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'shoujohearts';
        super.label = 'ShoujoHearts';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://shoujohearts.com';
        this.path = '/reader/directory/';
        this.language = 'english';
    }
}