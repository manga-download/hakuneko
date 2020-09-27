import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SekteKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'sektekomik';
        super.label = 'SEKTEKOMIK.COM';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'http://sektekomik.com';
        this.path = '/manga/list-mode/';

        this.queryChapters = 'div#chapterlist ul li div.eph-num a';
        this.queryChaptersTitle = 'span.chapternum';
    }
}