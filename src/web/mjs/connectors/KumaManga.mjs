import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KumaManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'kumamanga';
        super.label = 'KumaManga';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://kumamanga.my.id';
        this.path = '/manga-list/?list';

        this.querMangaTitleFromURI = 'div.series-title h2';
        this.queryMangas = 'div.mangalist-blc ul li a';
        this.queryChapters = 'div.series-chapter ul.series-chapterlist li div.flexch-infoz a';
        this.queryChaptersTitle = 'span';
        this.queryChaptersTitleBloat = 'span > span.date';
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }
}
