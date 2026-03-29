import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class DeathTollScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'deathtollscans';
        super.label = 'DeathTollScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://reader.deathtollscans.net';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}