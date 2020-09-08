import FoolSlide from './templates/FoolSlide.mjs';

export default class KirishimaFansub extends FoolSlide {

    constructor() {
        super();
        super.id = 'kirishimafansub';
        super.label = 'KirishimaFansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://www.kirishimafansub.net';
        this.path = '/lector/directory/';
        this.language = 'spanish';
    }
}