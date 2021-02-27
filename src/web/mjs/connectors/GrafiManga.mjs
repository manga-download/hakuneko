import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class GrafiManga extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'grafimanga';
        super.label = 'GrafiManga';
        this.tags = [ 'manga', 'webtoon', 'high-quality', 'spanish', 'scanlation' ];
        this.url = 'https://grafimanga.com';

        this.queryChapters = 'div.chapters h3.chapter-title a';
    }
}