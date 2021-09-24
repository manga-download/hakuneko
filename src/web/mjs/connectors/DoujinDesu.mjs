import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class DoujinDesu extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'doujindesu';
        super.label = 'DoujinDesu';
        this.tags = ['hentai', 'indonesian'];
        this.url = 'https://doujindesu.id';
        this.path = '/komik-list/?list';

        this.querMangaTitleFromURI = 'div#infoarea div.post-body h1.entry-title';
        this.queryMangas = 'div.listttl ul li a';
        this.queryChapters = 'div#chapter_list div.epsleft span.lchx a';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
    }
}