import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class DoujinDesu extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'doujindesu';
        super.label = 'DoujinDesu';
        this.tags = ['hentai', 'indonesian'];
        this.url = 'https://doujindesu.id';
        this.path = '/komik-list/?list';

        this.queryMangas = 'div.listttl ul li a';
        this.queryChapters = 'div#chapter_list span.eps a';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }
}