import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Katakomik extends WordPressMangastream {
    constructor() {
        super();
        super.id = 'katakomik';
        super.label = 'Katakomik';
        this.tags = ['webtoon', 'indonesian'];
        this.url = 'https://www.katakomik.my.id';

        this.queryMangas = 'div.bsx a';
        this.queryChapters = 'div.eph-num a';
        this.queryChaptersTitle = 'span.chapternum';
        this.queryPages = 'img.ts-main-image.curdown';
    }
}
