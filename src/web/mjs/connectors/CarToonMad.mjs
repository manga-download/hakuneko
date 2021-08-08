import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class CarToonMad extends Connector {

    constructor() {
        super();
        super.id = 'cartoonmad';
        super.label = 'CarToonMad';
        this.tags = ['manga', 'chinese'];
        this.url = 'https://www.cartoonmad.com';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangas() {
        let mangaList = [];
        const request = new Request(new URL('/comic99.html', this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'td[align] > a:last-child.pages');
        const pageCount = parseInt(data[0].href.match(/(\d+)\.html/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL('/comic99.'+String(page).padStart(2, '0')+'.html', this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'a.a1', 0, 'big5');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'td:nth-child(2)  tr:nth-child(3) > td:nth-child(2) > a:last-child', 0, 'big5');
        const id = uri.pathname + uri.search;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, '#info td > a', 0, 'big5');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'body');
        const maxpage = parseInt(data[0].querySelector('a:nth-last-of-type(2).pages').textContent);
        const pageone = data[0].querySelector('a > source[oncontextmenu]').src;
        return [...new Array(maxpage).keys()].map(index => {
            return this.createConnectorURI({
                url: pageone.replace(/(\d+)$/, String(index + 1).padStart(3, '0')),
                referer: request.url
            });
        });
    }

    async _handleConnectorURI(payload) {
        const request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}