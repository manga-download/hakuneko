import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Manga9 extends Connector {

    constructor() {
        super();
        super.id = 'manga9';
        super.label = 'Manga Raw (manga9.co)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://manga9.co';

        this.path = '/list/?page=';
        this.queryMangaTitle = 'main#primary h1';
        this.queryMangaPages = 'div.wp-pagenavi span.pages';
        this.queryMangas = 'div.card-body div.rotate-img a';
        this.queryChapters = 'div.list-scoll a';
        this.queryPages = 'div.card-wrap source';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitle);
        const id = uri.pathname;
        const title = data[0].textContent.replace(/\(Raw( – Free)?\)/, '').trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        const request = new Request(new URL(this.path, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaPages);
        const pageCount = parseInt(data[0].textContent.split('/').pop());
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL(this.path + page, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.replace(/\(Raw( – Free)?\)/, '').trim()
            };
        });
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.match(/【([^【】]+)】\s*$/)[1],
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        return data.map(image => this.createConnectorURI(image.dataset.src));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        request.headers.set('x-referer', `${this.url}/`);
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}