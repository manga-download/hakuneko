import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class JapanRead extends Connector {

    constructor() {
        super();
        super.id = 'japanread';
        super.label = 'Japanread';
        this.tags = ['manga', 'webtoon', 'french'];
        this.url = 'https://www.japanread.cc';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.card-manga h1.card-header');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/manga-list?page=' + page, this.url);
        const request = new Request(uri, {
            method: 'POST',
            body: 'list_view=3',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        const data = await this.fetchDOM(request, 'div.row a.manga_title');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChaptersFromPage(manga, page) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(`${uri}?page=${page}`, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.chapter-container div.chapter-row a.text-truncate');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapList = [];
        for (let page = 1, run = true; run; page++) {
            let chapters = await this._getChaptersFromPage(manga, page);
            chapters.length ? chapList.push(...chapters) : run = false;
        }
        return chapList;
    }

    async _getPages(chapter) {
        const script = `
            new Promise(async (resolve, reject) => {
                if(document.querySelector('form#captcha-form')) {
                    return reject(new Error('The chapter is protected by reCaptcha! Use the manual website interaction to solve the Captcha for an arbitrary chapter before downloading any other chapter from this website.'));
                }
                const info = document.querySelector('head meta[data-chapter-id]');
                const uri = new URL('/api/?type=chapter&id=' + info.dataset.chapterId, window.location.origin);
                const customHeaders = {
                    headers: {"a":"Math.random().toString(16)"}
                };
                const response = await fetch(uri.href,customHeaders);
                const data = await response.json();
                debugger
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