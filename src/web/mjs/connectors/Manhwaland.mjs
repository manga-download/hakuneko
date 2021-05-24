import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Manhwaland extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manhwaland';
        super.label = 'Manhwaland';
        this.tags = [ 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://manhwaland.cc';
        this.path = '/manhwa-list/';

        this.querMangaTitleFromURI = 'div.series-info div.series-titlex h1';
        this.queryMangas = 'div.mangalist-blc ul li.Manhwa a.series';
        this.queryChapters = 'div.series-chapter ul.series-chapterlist li div.flexch-infoz a';
        this.queryChaptersTitle = 'span';
        this.queryChaptersTitleBloat = 'span > span';
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }
}