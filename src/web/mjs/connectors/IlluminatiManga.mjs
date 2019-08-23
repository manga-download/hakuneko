import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class IlluminatiManga extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'illuminatimanga';
        super.label = 'IlluminatiManga';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'http://reader.manga-download.org';
        //this.path        = '/directory/';
        this.language = 'english';
    }
}