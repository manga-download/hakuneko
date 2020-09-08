import WordPressEManga from './templates/WordPressEManga.mjs';

export default class BacaKomik extends WordPressEManga {

    constructor() {
        super();
        super.id = 'bacakomik';
        super.label = 'BacaKomik';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://bacakomik.co';
        this.path = '/daftar-manga/?list';

        this.queryMangas = 'div.cpp div.daftarkartun div.jdlbar ul li a.tip';
        this.queryChapters = 'div.eps_lst ul li span.lchx a';
        this.queryPages = 'div.chapter-area div.chapter-content div.chapter-image source';
    }
}