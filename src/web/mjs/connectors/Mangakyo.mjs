import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Mangakyo extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangakyo';
        super.label = 'Mangakyo';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://mangakyo.org';
        this.path = '/komik/list-mode/';

        this.queryChapters = 'div.bxcl ul li div.eph-num a';
    }
}
