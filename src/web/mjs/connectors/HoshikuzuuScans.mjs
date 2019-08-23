import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class HoshikuzuuScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'hoshikuzuuscans';
        super.label = 'HoshikuzuuScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://hoshiscans.shounen-ai.net';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}