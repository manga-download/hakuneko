import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class ForgottenScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'forgottenscans';
        super.label = 'ForgottenScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://reader.fos-scans.com';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}