import TAADD from './TAADD.mjs';

export default class WieManga extends TAADD {

    constructor() {
        super();
        super.id = 'wiemanga';
        super.label = 'WieManga';
        this.tags = [ 'manga', 'german' ];
        this.url = 'https://www.wiemanga.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.bypassAdultWarning = false;
        this.queryMangaTitle = 'div.mangabookbox div.bookmessagebox h1';
        this.queryMangas = 'table tr td a.resultbookname';
        this.queryChapters = 'div.chapterlist table tr td.col1 a';
        this.queryPages = 'select#page';
        this.queryImages = 'source#comicpic';
    }
}