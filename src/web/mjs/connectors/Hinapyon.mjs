import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Hinapyon extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'hinapyon';
        super.label = 'HinaPyon';
        this.tags = [ 'hentai', 'indonesian' ];
        this.url = 'https://hinapyon.top';
        this.path = '/list-doujin/?list';

        this.queryMangas = 'div#container div.listpst ul li a';
        this.queryChapters = 'div#chapter_list div.epsleft span.lchx a';
        this.queryPages = 'div.reader-area img[src]:not([src=""])';
        this.queryChaptersTitle = undefined;
        this.querMangaTitleFromURI = 'div#infoarea div.post-body h1.entry-title';
    }
}
