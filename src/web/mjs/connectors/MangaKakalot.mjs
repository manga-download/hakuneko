import MangaNel from './MangaNel.mjs';

export default class MangaKakalot extends MangaNel {

    constructor() {
        super();
        super.id = 'mangakakalot';
        super.label = 'MangaKakalot';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.mangakakalot.gg';
    }
}