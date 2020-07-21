import MangaNel from './MangaNel.mjs';

export default class MangaKakalot extends MangaNel {

    constructor() {
        super();
        super.id = 'mangakakalot';
        super.label = 'MangaKakalot';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangakakalot.com';

        this.path = '/manga_list?type=new&category=all&alpha=all&state=all&group=all&page=';
        this.queryMangaTitle = 'div.manga-info-top ul.manga-info-text h1';
        this.queryMangasPageCount = 'div.group_page a.page_last:last-of-type';
        this.queryMangas = 'div.truyen-list h3 a';
        // NOTE: a corresponding entry for chapter/page queries must be defined in the base class (required for cross-domain-support)
    }

    canHandleURI(uri) {
        // Verification: https://regex101.com/r/...
        return /^mangakakalot.com$/.test(uri.hostname);
    }
}