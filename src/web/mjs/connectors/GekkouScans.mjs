import FoolSlide from './templates/FoolSlide.mjs';

export default class GekkouScans extends FoolSlide {

    constructor() {
        super();
        super.id = 'gekkouscans';
        super.label = 'Gekkou Scans';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'http://leitor.mangascenter.com.br';
        this.language = 'portuguese';
    }
}