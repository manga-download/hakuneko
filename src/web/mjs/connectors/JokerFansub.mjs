import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class JokerFansub extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'jokerfansub';
        super.label = 'JokerFansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://reader.jkrfb.xyz';
        //this.path        = '/directory/';
        this.language = 'spanish';
    }
}