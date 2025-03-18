import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ToonilyMe extends Connector {
    constructor() {
        super();
        super.id = 'toonilyme';
        super.label = 'ToonilyMe Manga';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://toonily.me';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.name.box > h1');
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            if (mangas.length > 0) {
                mangaList.push(...mangas);
            } else {
                run = false;
            }
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(`${this.url}/az-list?page=${page}`, this.requestOptions);

        const data = await this.fetchDOM(request, 'div.title > h3 > a');

        return data.map(element => ({
            id: this.getRootRelativeOrAbsoluteLink(element, this.url),
            title: element.text.trim()
        }));
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul#chapter-list > li > a');
        return data.map(element => {
            let titleElement = element.querySelector('strong.chapter-title');
            let chapterTitle = titleElement ? titleElement.textContent.trim() : element.text.trim();
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: chapterTitle,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        const data = await this.fetchRegex(request, /<img[^>]+(?:src|data-src)="((?!.*\/thumb\/)[^"]+)"/g);
        return data.map((element) => {
            return this.createConnectorURI({
                url: this.getAbsolutePath(element, request.url),
            });
        });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', this.url);
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}
