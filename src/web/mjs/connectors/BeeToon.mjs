import WordPressZbulu from './templates/WordPressZbulu.mjs';

export default class BeeToon extends WordPressZbulu {

    constructor() {
        super();
        super.id = 'beetoon';
        super.label = 'BeeToon';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'http://beetoon.net';
        this.queryChaptersPageCount = 'div.pagination-container div.pagination a.next:last-of-type:not(#getcm)';
        this.queryChapters = 'div#chapterList div.items-chapters a';
        this.queryChaptersName = 'div.r1 h2.chap';
    }

    canHandleURI(uri) {
        return /(ww\d+\.)?beetoon\.net/.test(uri.hostname);
    }

    async _initializeConnector() {
        let uri = new URL(this.url);
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }

    async _getChaptersFromPage(manga, page) {
        let uri = new URL(manga.id + this.pathChapters.replace('%PAGE%', page), this.url);
        uri.pathname = uri.pathname.replace(/\/+/g, '/');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: new URL(element.href, request.url).pathname,
                title: element.querySelector(this.queryChaptersName).textContent.replace(manga.title, '').replace(this.chapterTitleFilter, '').trim(),
                language: 'en'
            };
        });
    }

    async _getPages(chapter) {
        const pages = await super._getPages(chapter);
        return pages
            .map( page => {
                let link = new URL(page);
                link = link.searchParams.get('url') || link; //deproxify url if needed
                return link.href;
            })
            .filter(page => !page.includes('/gadgets/proxy?'));//remove fake images (that were not deproxified)
    }
}
