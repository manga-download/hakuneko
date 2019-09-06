import FoolSlide from './templates/FoolSlide.mjs';

export default class SenseScans extends FoolSlide {

    constructor() {
        super();
        super.id = 'sensescans';
        super.label = 'SenseScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://sensescans.com';
        this.path = '/reader/directory/';
        this.language = 'english';
    }
}