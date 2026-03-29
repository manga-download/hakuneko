import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaHubRU extends Connector {

    constructor() {
        super();
        super.id = 'mangahubru';
        super.label = 'MangaHub.RU';
        this.tags = [ 'manga', 'webtoon', 'russian' ];
        this.url = 'https://mangahub.ru';
        this.requestOptions.headers.set('x-cookie', 'confirm_age=1');
        this.requestOptions.headers.set('x-referer', this.url);

    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'source.cover');
        let id = uri.pathname + uri.search;
        let title = data[0].getAttribute('alt').trim();
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
        let data = await this.fetchDOM(request, 'div.container div.card a.fw-medium');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id + '/chapters', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.detail-chapters div.detail-chapter div.flex-column a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(/\s+/g, ' ').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'source.reader-viewer-img');
        return data.map(entry => this.createConnectorURI(this.getAbsolutePath(entry.dataset.src, request.url)));
    }
}
