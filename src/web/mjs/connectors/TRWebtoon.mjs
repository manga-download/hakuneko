import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class TRWebtoon extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'trwebtoon';
        super.label = 'TR Webtoon';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://trwebtoon.com';

        this.queryChapters = 'ul.chapters li h5.chapter-title-rtl a';
        this.language = 'tr';
    }
}