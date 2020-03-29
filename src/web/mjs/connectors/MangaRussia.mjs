import TAADD from './TAADD.mjs';

export default class MangaRussia extends TAADD {

    constructor() {
        super();
        super.id = 'mangarussia';
        super.label = 'MangaRussia';
        this.tags = [ 'manga', 'russian' ];
        this.url = 'http://www.mangarussia.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.bypassAdultWarning = false;
        this.queryMangaTitle = 'div.mangabookbox div.bookmessagebox h1';
        this.queryMangas = 'table tr td a.resultbookname';
        this.queryChapters = 'div.chapterlist table tr td.col1 a';
        this.queryPages = 'select#page';
        this.queryImages = 'source#comicpic';
    }
}