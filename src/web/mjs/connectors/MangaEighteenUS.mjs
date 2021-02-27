import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class MangaEighteenUS extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'manga18-us';
        super.label = 'Manga18.us';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://manga18.us';

        this.queryMangas = 'ul.price-list li a';
        this.queryChapters = 'ul.chapters li h3.chapter-title-rtl a';
        this.language = 'en';
    }
}