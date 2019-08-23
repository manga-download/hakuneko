import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class SeaOtterScans extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'seaotterscans';
        super.label = 'SeaOtterScans';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://reader.seaotterscans.com';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}