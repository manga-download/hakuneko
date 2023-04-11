import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class bentomanga extends Connector {

    constructor() {
        super();
        super.id = 'bentomanga';
        super.label = 'Bentô Manga';
        this.tags = ['manga', 'webtoon', 'novel', 'french'];
        this.url = 'https://bentomanga.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.component-manga-title_main h1');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        const pageCount = await this._getListPageCount('/manga_list');
        for (let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const path = '/manga_list';
        const dom = await this._getListPage(path, page);
        const data = [...dom.querySelectorAll('div.div-manga_cover a')];
        return data.map((element) => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url + path + '?limit=' + (page - 1)),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        const pageCount = await this._getListPageCount(manga.id);
        for (let page = 1; page <= pageCount; page++) {
            const chapters = await this._getChaptersFromPage(manga.id, page);
            chapterList.push(...chapters);
        }
        return chapterList;
    }

    async _getChaptersFromPage(id, page) {
        const dom = await this._getListPage(id, page);
        let data = [...dom.querySelectorAll('div.component-chapter-title > a')];
        return data.map((element) => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url + id),
                title: element.querySelector('span.chapter_volume').innerText.trim() + ' ' + element.querySelector('span.chapter_title').innerText.trim(),
                language: ''
            };
        });
    }

    async _getListPageCount(path) {
        const request = new Request(this.url + path, this.requestOptions); // make GET request without query params. BentoManga doesn't respond with the paginator in a _getListPage() request for HakuNeko, but does for my Firefox browser.
        const data = await this.fetchDOM(request, 'p.paginator');
        const pageCount = data[0].dataset.max_limit ? parseInt(data[0].dataset.max_limit) : 1;
        return pageCount;
    }

    async _getListPage(path, page) {
        let pageNumber = page - 1; // page count starts with 0.
        let request = new Request(this.url + path + '?limit=' + pageNumber, this.requestOptions);
        request.headers.set('X-Requested-With', 'XMLHttpRequest'); // set nessecary header to get json api response.
        const data = await this.fetchJSON(request);
        const dom = this.createDOM(data.mangas || data.datas); // json has html data in manga "mangas" or chapter "datas" string.
        return dom;
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
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(image => this.createConnectorURI({
            url: image,
            referer: request.url
        }));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        let data = await response.blob();
        return this._blobToBuffer(data);
    }
}