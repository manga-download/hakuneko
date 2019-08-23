import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class MangaSubES extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangasubes';
        super.label = 'MangaSubES';
        this.tags = [ 'manga', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'http://mangasubes.patyscans.com';
        //this.path        = '/directory/';
        this.language = 'spanish';
    }
}