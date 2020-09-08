import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class ManhwasMen extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'manhwasmen';
        super.label = 'Manhwas Men';
        this.tags = [ 'webtoon', 'hentai', 'korean', 'english' ];
        this.url = 'https://manhwas.men';

        this.queryMangas = 'ul.price-list li a';
        this.queryChapters = 'ul.chapters li h3.chapter-title-rtl';
        this.language = '';
    }
}