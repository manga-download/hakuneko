import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class SolitarioNoFansub extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'solitarionofansub';
        super.label = 'SolitarioNoFansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'http://snf.mangaea.net';
        this.path = '/slide/directory/';
        this.language = 'spanish';
    }
}