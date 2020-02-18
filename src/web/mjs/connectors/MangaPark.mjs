import AnyACG from './templates/AnyACG.mjs';

export default class MangaPark extends AnyACG {

    constructor() {
        super();
        super.id = 'mangapark';
        super.label = 'MangaPark (by AnyACG)';
        this.tags = [ 'manga', 'multi-lingual' ];
        this.url = 'https://mangapark.org';
        this.requestOptions.headers.set('x-cookie', 'h=1');

        this.path = '/browse?sort=title&page=';
        this.queryMangaTitle = 'div.container div h3';
        this.queryMangaTitleText = 'a';
        //this.queryMangaTitleFlag = undefined;
        this.queryMangaPages = 'nav.pager ul.pagination li.page-item:nth-last-child(2) a.page-link';
        this.queryMangas = 'div#browse div div h6';
        this.queryMangaLink = 'a';
        //this.queryMangaFlag = undefined;
        //this.queryChapters = 'div.chapter-list div.main a.chapt';
        this.queryPages = /(?:load_pages|images)\s*=\s*(\[.*?\])\s*;/g;
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let response = await fetch(request);
        let data = await response.text();
        let chapterList = [];
        let dom = this.createDOM(data);
        dom.querySelectorAll('div.card').forEach(card => {
            let info = card.querySelector('div.card-header a.ml-1').text;
            let locale = info.match(/\[(.*?)\]/)[1];
            let source = info.match(/\[.*?\]\s*(.*)$/)[1];
            let chapters = [...card.querySelectorAll('div.card-body ul li div:first-of-type a.ml-2')].map(element => {
                let title = element.text.replace(manga.title, '').trim() + ` (${locale}) [${source}]`;
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: title,
                    language: locale
                };
            });
            chapterList = chapterList.concat(chapters);
        });
        return chapterList;
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchRegex(request, this.queryPages);
        return JSON.parse(data[0]).map(page => page['u'] ? page.u : page);
    }
}