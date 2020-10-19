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
        this.queryMangaPages = 'nav.d-none ul.pagination li.page-item:nth-last-child(2) a.page-link';
        this.queryMangas = 'div#series-list div.item-text';
        this.queryMangaLink = 'a.item-title';
        this.queryMangaFlag = 'span.item-flag';
        this.queryChapters = 'div.episode-list div.main a.visited';
        this.queryPages = /images\s*=\s*(\[[^\]]+\])\s*;/g;
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchRegex(request, this.queryPages);
        data = Object.values(JSON.parse(data[0]));
        return data.map(element => new URL(element, request.url).href);
    }
}