import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class AkaiYuhiMun extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'akaiyuhimun';
        super.label = 'AkaiYuhiMun Team';
        this.tags = [ 'manga', 'high-quality', 'russian', 'scanlation' ];
        this.url = 'https://akaiyuhimun.ru';
        this.path = '/manga/directory/';
        this.language = 'russian';
    }
}