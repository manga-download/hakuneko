import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class MangaEighteenClub extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'manga18-club';
        super.label = 'Manga18.club';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://manga18.club';

        this.queryMangas = 'ul.price-list li a';
        this.queryChapters = 'ul.chapters li h3.chapter-title-rtl a';
        this.language = 'en';
    }
}