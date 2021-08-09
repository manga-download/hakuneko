import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class DoujinLand extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'doujinland';
        super.label = 'DOUJINLAND';
        this.tags = [ 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://doujinland.online';
        this.path = '/manga-list/?list';

        this.querMangaTitleFromURI = 'div.series-title h2';
        this.queryMangas = 'div.mangalist-blc ul li a';
        this.queryChapters = 'div.series-chapter ul.series-chapterlist li div.flexch-infoz a';
        this.queryChaptersTitle = 'span';
        this.queryChaptersTitleBloat = 'span > span.date';
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }
}