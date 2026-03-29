import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaKane extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangakane';
        super.label = 'MangaKane';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangakane.com';
        this.path = '/daftar-komik/';

        this.querMangaTitleFromURI = 'div.series-title h2';
        this.queryMangas = 'div.mangalist-blc ul li.Manga a.series';
        this.queryChapters = 'div.series-chapter ul.series-chapterlist li div.flexch-infoz a';
        this.queryChaptersTitle = 'span';
        this.queryChaptersTitleBloat = 'span > span.date';
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }

    async _getPages(chapter) {
        const fakeLinkPatterns = [
            /[.,]5\.(jpg|png)$/i,
            /iklan\.(jpg|png)$/i,
            /zz\.(jpg|png)$/i,
            /\.filerun\./i
        ];
        let pageList = await super._getPages(chapter);
        return pageList.filter(link => !fakeLinkPatterns.some(pattern => pattern.test(link)));
    }
}