import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class JaiminisBox extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'jaiminisbox';
        super.label = 'JaiminisBox';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://jaiminisbox.com';
        this.path = '/reader/directory/';
        this.language = 'english';
    }
}