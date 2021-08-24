import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikPlay extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikplay';
        super.label = 'KomikPlay';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://komikplay.com';
        this.path = '/daftar-komik/';

        this.querMangaTitleFromURI = 'div.series-title h2';
        this.queryMangas = 'div.mangalist-blc ul li.Manga a.series';
        this.queryChapters = 'div.series-chapter ul.series-chapterlist li div.flexch-infoz a';
        this.queryChaptersTitle = 'span';
        this.queryChaptersTitleBloat = 'span > span.date';
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }
}