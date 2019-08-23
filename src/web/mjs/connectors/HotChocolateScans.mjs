import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class HotChocolateScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'hotchocolatescans';
        super.label = 'HotChocolateScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://hotchocolatescans.com';
        this.path = '/fs/directory/';
        this.language = 'english';
    }
}