import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class LianScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'lianscans';
        super.label = 'LIAN';
        this.tags = [ 'manga', 'indonesian', 'scanlation' ];
        this.url = 'https://www.lianscans.my.id';
        this.path = '/manga-list/';

        this.querMangaTitleFromURI = 'div.series-title h2';
        this.queryMangas = 'div.mangalist-blc ul li.Manga a.series';
        this.queryChapters = 'div.series-chapter ul.series-chapterlist li div.flexch-infoz a';
        this.queryChaptersTitle = 'span';
        this.queryChaptersTitleBloat = 'span > span.date';
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }
}