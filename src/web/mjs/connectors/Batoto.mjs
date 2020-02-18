import AnyACG from './templates/AnyACG.mjs';

export default class Batoto extends AnyACG {

    constructor() {
        super();
        super.id = 'batoto';
        super.label = 'Batoto (by AnyACG)';
        this.tags = [ 'manga', 'multi-lingual' ];
        this.url = 'https://bato.to';

        this.path = '/browse?sort=title&page=';
        this.queryMangaTitle = 'div#series-page div.title-set';
        this.queryMangaTitleText = 'h3.item-title a';
        this.queryMangaTitleFlag = 'span.item-flag';
        this.queryMangaPages = 'nav.pager ul.pagination li.page-item:nth-last-child(2) a.page-link';
        this.queryMangas = 'div#series-list div.item-text';
        this.queryMangaLink = 'a.item-title';
        this.queryMangaFlag = 'span.item-flag';
        this.queryChapters = 'div.chapter-list div.main a.chapt';
        this.queryPages = /images\s*=\s*(\{.*\})\s*;/g;
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchRegex(request, this.queryPages);
        return Object.values(JSON.parse(data[0]));
    }
}