import WordPressEManga from './templates/WordPressEManga.mjs';

/**
 *
 */
export default class MangaPus extends WordPressEManga {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangapus';
        super.label = 'MangaPus';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangapus.com';
        this.path = '/manga-list/?list';

        this.queryMangas = 'div.cpp div.daftarkartun div.jdlbar ul li a.tip';
        this.queryChapters = 'div.bxcl ul li span.lchx a';
        this.queryPages = 'div.chapter-area div.chapter-content div.chapter-image source.imgchp';
    }
}