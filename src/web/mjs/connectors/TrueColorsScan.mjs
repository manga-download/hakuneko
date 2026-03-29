import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class TrueColorsScan extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'truecolorsscan';
        super.label = 'TrueColorsScan';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://truecolorsscans.miocio.org';
        //this.path        = '/directory/';
        this.language = 'spanish';
    }
}