import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class WorldThree extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'worldthree';
        super.label = 'WorldThree';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://www.slide.world-three.org';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}