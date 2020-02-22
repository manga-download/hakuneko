import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Tapas extends Connector {

    constructor() {
        super();
        super.id = 'tapas';
        super.label = 'Tapas';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://tapas.io';
        this.requestOptions.headers.set('x-cookie', 'adjustedBirthDate=1990-01-01');
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'header.series-header h1.title a.series-header-title');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let uri = new URL('/comics', this.url);
        uri.searchParams.set('browse', 'ALL');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.global-pagination-wrap a.page-num');
        let pageCount = parseInt(data.pop().text);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL('/comics', this.url);
        uri.searchParams.set('browse', 'ALL');
        uri.searchParams.set('pageNumber', page);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.content-list-wrap li.content-item a.title');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchRegex(request, /episodeList\s*:\s*(\[\s*\{.*?\}\s*\])/g);
        return JSON.parse(data[0])
            //.filter(chapter => !chapter.locked)
            .map(chapter => {
                return {
                    id: '/episode/view/' + chapter.id,
                    title: chapter.scene + ' - ' + chapter.title,
                    language: ''
                };
            });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchJSON(request);
        let dom = this.createDOM(data.data.html);
        return [...dom.querySelectorAll('source.art-image')].map(element => this.getAbsolutePath(element, request.url));
    }
}