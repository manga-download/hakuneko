import MangaNel from './MangaNel.mjs';

export default class MangaKakalot extends MangaNel {

    constructor() {
        super();
        super.id = 'mangakakalot';
        super.label = 'MangaKakalot';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangakakalot.com';

        this.path = '/manga_list?type=new&category=all&alpha=all&state=all&group=all&page=';
        this.queryMangasPageCount = 'div.group_page a.page_last:last-of-type';
        this.queryMangas = 'div.truyen-list h3 a';
        this.queryChapters = 'div.chapter-list div.row span a';
        this.queryPages = 'div#vungdoc source, div.vung-doc source, div.vung_doc source';
    }
}