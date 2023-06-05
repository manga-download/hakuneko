import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikindoInfo extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikindoinfo';
        super.label = 'KomikindoInfo';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://komikindo.info';
        this.path = '/manga-list/';

        this.querMangaTitleFromURI = 'div.series-title h2';
        this.queryMangas = 'div.mangalist-blc ul li.Manga a.series';
        this.queryChapters = 'div.series-chapter ul.series-chapterlist li div.flexch-infoz a';
        this.queryChaptersTitle = undefined;
        this.queryChaptersTitleBloat = 'span.date';
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }
}
