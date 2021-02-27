import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MaID extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'maid';
        super.label = 'MAID';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://www.maid.my.id';
        this.path = '/manga-list/?list';

        this.querMangaTitleFromURI = 'div.series-title h2';
        this.queryMangas = 'div.mangalist-blc ul li.Manga a.series';
        this.queryChapters = 'div.series-chapter ul.series-chapterlist li div.flexch-infoz a';
        this.queryChaptersTitle = 'span.ch';
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }
}