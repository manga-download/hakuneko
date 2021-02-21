import FoolSlide from './templates/FoolSlide.mjs';

export default class SeinagiFansubEN extends FoolSlide {

    constructor() {
        super();
        super.id = 'seinagifansub-en';
        super.label = 'SeinagiFansub (EN)';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://seinagi.org.es';
        this.links = {
            login: 'https://seinagi.org.es/forum/index.php?action=login'
        };
        this.path = '/reader/directory/';
        this.language = 'english';
    }
}