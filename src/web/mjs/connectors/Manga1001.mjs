import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Manga1001 extends Connector {

    constructor() {
        super();
        super.id = 'manga1001';
        super.label = 'Manga 1001';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://manga1001.com';
    }

    canHandleURI(uri) {
        return /^manga100[01]\.com$/.test(uri.hostname);
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'header.entry-header h1.entry-title');
        let id = decodeURI(uri.pathname);
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let uri = new URL(this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'nav.pagination div.nav-links a.page-numbers:nth-last-of-type(2)');
        let pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL(`/page/${page}/`, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'main#main header.entry-header h3.entry-title a');
        return data.map(element => {
            return {
                id: decodeURI(element.pathname),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chaplist table.table tbody tr td:first-of-type a');
        return data.map(element => {
            return {
                id: decodeURI(element.pathname),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.entry-content figure.wp-block-image source');
        return data.map(element => {
            return this.createConnectorURI({
                url: this.getAbsolutePath(element.dataset.src || element, request.url),
                referer: request.url
            });
        });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}