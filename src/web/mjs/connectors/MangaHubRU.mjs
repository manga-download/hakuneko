import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaHubRU extends Connector {

    constructor() {
        super();
        super.id = 'mangahubru';
        super.label = 'MangaHub';
        this.tags = [ 'manga', 'webtoon', 'russian' ];
        this.url = 'https://mangahub.ru';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.page-head h1[itemprop="name"]');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/explore', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.pagination li:nth-last-of-type(2) a');
        let pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/explore?page=' + page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.container div.card a.comic-grid-name');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.container div.card div[data-chapter] div:first-of-type a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(/\s+/g, ' ').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div[data-js-scans]');
        return JSON.parse(data[0].dataset.jsScans).map(entry => this.getAbsolutePath(entry.src, request.url));
    }
}