import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class IskultripScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'iskultripscans';
        super.label = 'Iskultrip Scans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://www.maryfaye.net';
        this.path = '/reader/directory/';
        this.language = 'english';
    }
}