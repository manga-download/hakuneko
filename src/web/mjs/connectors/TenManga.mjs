import TAADD from './TAADD.mjs';

/**
 *
 */
export default class TenManga extends TAADD {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'tenmanga';
        super.label = 'TenManga';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://www.tenmanga.com';

        //this.queryMangasPageCount = '';
        this.pageCount = 750;
        this.queryMangas = 'ul#list_container li dd.book-list a:first-of-type';
        this.queryChapters = 'ul.chapter-box li div.chapter-name.short a';
        this.queryPages = 'select.sl-page option';
        this.queryImages = 'div.pic_box source.manga_pic';
    }
}