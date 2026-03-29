import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class HelveticaScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'helveticascans';
        super.label = 'HelveticaScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://helveticascans.com';
        this.path = '/r/directory/';
        this.language = 'english';
    }
}