import TAADD from './TAADD.mjs';

/**
 *
 */
export default class MangaRussia extends TAADD {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'mangarussia';
        super.label = 'MangaRussia';
        this.tags = [ 'manga', 'russian' ];
        this.url = 'http://www.mangarussia.com';
        this.requestOptions.headers.set( 'x-referer', this.url );

        //this.queryMangasPageCount = '';
        this.pageCount = 500;
        this.queryMangas = 'table tr td a.resultbookname';
        this.queryChapters = 'div.chapterlist table tr td.col1 a';
        this.queryPages = 'select#page option';
        this.queryImages = 'source#comicpic';
    }
}