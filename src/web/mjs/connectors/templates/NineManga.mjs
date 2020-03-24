import TAADD from '../TAADD.mjs';

export default class NineManga extends TAADD {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;

        //this.bypassAdultWarning = true;
        this.queryMangaTitle = 'div.manga div.ttline h1';
        this.queryMangas = 'ul.direlist li dl.bookinfo dd a.bookname';
        this.queryChapters = 'div.chapterbox ul li a.chapter_list_a';
        this.queryPages = 'select#page';
        this.queryImages = 'source.manga_pic';
    }
}