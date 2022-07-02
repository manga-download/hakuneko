import WordPressZbulu from './templates/WordPressZbulu.mjs';

export default class BeeToon extends WordPressZbulu {

    constructor() {
        super();
        super.id = 'beetoon';
        super.label = 'BeeToon';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'http://beetoon.net';
        this.queryChaptersPageCount = 'div.pagination-container div.pagination a.next:last-of-type:not(#getcm)';
        this.queryChaptersName = 'div.r1 h2.chap';
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
}