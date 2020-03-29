import TAADD from './TAADD.mjs';

export default class Manga99 extends TAADD {

    constructor() {
        super();
        super.id = 'manga99';
        super.label = 'Manga99';
        this.tags = [ 'manga', 'english' ];
        this.url = 'http://www.manga99.com';

        //this.bypassAdultWarning = true;
        this.queryMangaTitle = 'div.container_book div.book-info h1';
        this.queryMangas = 'ul#list_container li dd.book-list > a:first-of-type';
        this.queryChapters = 'ul.chapter-box li div.chapter-name.short a';
        this.queryPages = 'select.sl-page';
        this.queryImages = 'div.pic_box source.manga_pic';
    }
}