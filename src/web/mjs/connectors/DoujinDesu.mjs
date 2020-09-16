import WordPressMangastream from './templates/WordWordPressMangastreamPressEManga.mjs';

export default class DoujinDesu extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'doujindesu';
        super.label = 'DoujinDesu';
        this.tags = ['hentai', 'indonesian'];
        this.url = 'https://doujindesu.info';
        this.path = '/komik-list/?list';

        this.queryMangas = 'div.listttl ul li a';
        this.queryChapters = 'div#chapter_list span.eps a';
        this.queryPages = 'div.reader-area source[src]:not([src=""])';
    }
}