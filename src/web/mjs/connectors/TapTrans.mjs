import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class TapTrans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'taptrans';
        super.label = 'TapTrans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://taptaptaptaptap.net';
        this.path = '/fs/directory/';
        this.language = 'english';
    }
}