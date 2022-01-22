import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikIndoId extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikindoid';
        super.label = 'KomikIndoId';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikindo.id';
        this.path = '/daftar-komik/?list';

        this.querMangaTitleFromURI = 'main div.post-body h1.entry-title';
        this.queryMangas = '.daftarkartun #abtext .jdlbar ul li a';
        this.queryChapters = 'div#chapter_list span.lchx a';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div.chapter-area div.chapter-image img[src]:not([src=""])';
    }
}