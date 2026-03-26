import FoolSlide from './templates/FoolSlide.mjs';

/**
 *
 */
export default class MangaScouts extends FoolSlide {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangascouts';
        super.label = 'MangaScouts';
        this.tags = [ 'manga', 'high-quality', 'german', 'scanlation' ];
        this.url = 'http://onlinereader.mangascouts.org';
        this.path = '/directory/';
        this.language = 'german';
    }
}