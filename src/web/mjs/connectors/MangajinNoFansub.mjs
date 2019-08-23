import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class MangajinNoFansub extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangajinnofansub';
        super.label = 'MangajinNoFansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://www.mangajinnofansub.com';
        this.path = '/lector/directory/';
        this.language = 'spanish';
    }
}