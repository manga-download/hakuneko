import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class RainDropFansub extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'raindropfansub';
        super.label = 'Rain Drop Fansub';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://raindropteamfan.com';
        this.links = {
            login: 'https://raindropteamfan.com/auth/login'
        };

        this.queryMangas = 'ul.price-list li a';
        this.queryChapters = 'ul.chapters li h3.chapter-title-rtl a';
        this.language = 'tr';
    }
}