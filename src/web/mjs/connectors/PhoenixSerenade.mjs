import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class PhoenixSerenade extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'phoenixserenade';
        super.label = 'PhoenixSerenade';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://reader.serenade.moe';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}