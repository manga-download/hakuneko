import FoolSlide from './templates/FoolSlide.mjs';

export default class SeinagiFansubES extends FoolSlide {

    constructor() {
        super();
        super.id = 'seinagifansub-es';
        super.label = 'SeinagiFansub (ES)';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://seinagi.org.es';
        this.path = '/online/directory/';
        this.language = 'spanish';
    }
}