import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class RainDropFansub extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'raindropfansub';
        super.label = 'Rain Drop Fansub';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'http://okuma.raindropfansub.com';

        this.queryChapters = 'ul.chapters li h5.chapter-title-rtl a';
        this.language = 'tr';
    }
}