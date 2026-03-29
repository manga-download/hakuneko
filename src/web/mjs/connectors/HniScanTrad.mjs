import FoolSlide from './templates/FoolSlide.mjs';

export default class HniScanTrad extends FoolSlide {
    constructor() {
        super();
        super.id = 'hniscantrad';
        super.label = 'HNI-Scantrad';
        this.tags = [ 'manga', 'french', 'scanlation' ];
        this.url = 'http://hni-scantrad.com';
        this.path = '/lel/directory/';
    }
}