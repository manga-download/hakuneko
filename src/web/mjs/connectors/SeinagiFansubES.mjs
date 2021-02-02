import FoolSlide from './templates/FoolSlide.mjs';

export default class SeinagiFansubES extends FoolSlide {

    constructor() {
        super();
        super.id = 'seinagifansub-es';
        super.label = 'SeinagiFansub (ES)';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://seinagi.org.es';
        this.links = {
            login: 'https://seinagi.org.es/forum/index.php?action=login'
        };
        this.path = '/online/directory/';
        this.language = 'spanish';
    }
}