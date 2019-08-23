import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class YamiTenshiNoFansub extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'yamitenshinofansub';
        super.label = 'YamiTenshiNoFansub';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'http://lector.ytnofan.com';
        //this.path        = '/directory/';
        this.language = 'spanish';
    }
}