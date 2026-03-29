import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class Russification extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'russification';
        super.label = 'Русификация (Russification)';
        this.tags = [ 'manga', 'high-quality', 'russian', 'scanlation' ];
        this.url = 'https://rusmanga.ru';
        this.path = '/directory/';
        this.language = 'russian';
    }
}