import FoolSlide from './templates/FoolSlide.mjs';

export default class MabushiMajo extends FoolSlide {

    constructor() {
        super();
        super.id = 'mabushimajo';
        super.label = 'Mabushimajo';
        this.tags = [ 'manga', 'turkish' ];
        this.url = 'http://mabushimajo.com';
        this.path = '/onlineokuma/directory/';
        this.language = 'turkish';
    }
}