import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class KireiCake extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'kireicake';
        super.label = 'KireiCake';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://reader.kireicake.com';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}