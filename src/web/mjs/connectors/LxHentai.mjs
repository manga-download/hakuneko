import MojoPortalComic from './templates/MojoPortalComic.mjs';

export default class LxHentai extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'lxhentai';
        super.label = 'LxHentai(Hentai LXX)';
        this.tags = [ 'manga', 'hentai', 'vietnamese' ];
        this.url = 'https://lxhentai.com';

        this.queryMangaTitle = 'head title';
        this.queryChapter = 'div#listChuong li.row a';
        this.queryPages = 'div.reader div:not([class]) source';
        this.path = '/story/search.php?key=&status=&flexCat=&&type=&p=';
        this.queryMangasPageCount = 'ul.pagination li.page-item:last-child a';
        this.pathMatch = /p=(\d+)/;
        this.queryMangas = 'div.container div.row div.col-md-2 a';
    }
}