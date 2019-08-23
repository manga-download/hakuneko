import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class CanisMajorScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'canismajorscans';
        super.label = 'CanisMajorScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://cm-scans.shounen-ai.net';
        this.path = '/reader/directory/';
        this.language = 'english';
    }
}