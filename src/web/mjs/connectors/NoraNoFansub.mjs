import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class NoraNoFansub extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'noranofansub';
        super.label = 'NoraNoFansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://www.noranofansub.com';
        this.path = '/lector/directory/';
        this.language = 'spanish';
    }
}