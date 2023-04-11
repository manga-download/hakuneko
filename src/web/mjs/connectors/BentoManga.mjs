import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class BentoManga extends Connector {

    constructor() {
        super();
        super.id = 'bentomanga';
        super.label = 'Bentô Manga';
        this.tags = ['manga', 'webtoon', 'novel', 'french'];
        this.url = 'https://bentomanga.com';
    }

    canHandleURI(uri) {
        return /^https?:\/\/(www)?\.bentomanga\.com\/manga/.test(uri);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.component-manga-title_main h1');
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangaList = [];
        const request = new Request(new URL('/manga_list', this.url), this.requestOptions );
        let pageCount = await this.fetchDOM(request, 'p.paginator');
        pageCount = pageCount.length > 0 ? parseInt(pageCount[0].dataset['max_limit']) : 1;
        for (let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL('/manga_list?limit='+ (page-1) + '&cb='+ Date.now(), this.url), this.requestOptions );
        request.headers.set('X-Requested-With', 'XMLHttpRequest');
        let data = await this.fetchJSON(request);
        const dom = this.createDOM(data.mangas);
        const nodes = [...dom.querySelectorAll('a.component-manga-cover')];
        return nodes.map((element) => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const chapterList = [];
        const request = new Request(new URL(manga.id, this.url), this.requestOptions );
        let pageCount = await this.fetchDOM(request, 'p.paginator');
        pageCount = pageCount.length > 0 ? parseInt(pageCount[0].dataset['max_limit']) : 1;
        for (let page = 1; page <= pageCount; page++) {
            const chapters = await this._getChaptersFromPage(manga.id, page);
            chapterList.push(...chapters);
        }
        return chapterList;
    }

    async _getChaptersFromPage(id, page) {
        const request = new Request( new URL(id+'?limit='+ (page-1) + '&cb='+ Date.now(), this.url), this.requestOptions );
        request.headers.set('X-Requested-With', 'XMLHttpRequest');
        const data = await this.fetchJSON(request);
        const dom = this.createDOM(data.datas);
        const nodes = [...dom.querySelectorAll('div.component-chapter-title > a')];
        return nodes.map((element) => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('span.chapter_volume').innerText.trim() + ' ' + element.querySelector('span.chapter_title').innerText.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise(async (resolve, reject) => {
                const info = document.querySelector('head meta[data-chapter-id]');
                const uri = new URL('/api/?type=chapter&id=' + info.dataset.chapterId, window.location.origin);
                const customHeaders = {
                    headers: {'X-Requested-With' : 'XMLHttpRequest'}
                };
                const response = await fetch(uri.href,customHeaders);
                const data = await response.json();
                const images = data.page_array.map(page => new URL(data.baseImagesUrl + '/' + page, uri.href).href);
                resolve(images);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(image => this.createConnectorURI({
            url: image,
            referer: request.url
        }));
    }

    async _handleConnectorURI(payload) {
        const request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        const response = await fetch(request);
        const data = await response.blob();
        return this._blobToBuffer(data);
    }
}
