import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ManhwaIndo extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manhwaindo';
        super.label = 'ManhwaIndo';
        this.tags = ['webtoon', 'indonesian'];
        this.url = 'https://manhwaindo.com';
        this.path = '/daftar-manhwa/';

        this.querMangaTitleFromURI = 'div.series-info div.series-titlex h1';
        this.queryMangas = 'div.mangalist-blc ul li.Manhwa a.series';
        this.queryChapters = 'div.series-chapter ul.series-chapterlist li div.flexch-infoz a';
        this.queryChaptersTitle = 'span';
        this.queryChaptersTitleBloat = 'span > span';
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }
}