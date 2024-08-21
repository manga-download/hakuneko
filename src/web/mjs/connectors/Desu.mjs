import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Desu extends Connector {

    constructor() {
        super();
        super.id = 'desu';
        super.label = 'Desu';
        this.tags = ['manga', 'webtoon', 'russian'];
        this.url = 'https://desu.me';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.titleBar h1 span.name');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/manga/', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.PageNav');
        const pageCount = parseInt(data[0].dataset['last']);
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/manga/?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'h3 a.animeTitle.oTitle');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getChapters( manga ) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#animeView div.expandable ul.chlist li h4 a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getPages( chapter ) {
        let script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(Reader.images);
                    } catch(error) {
                        reject(error);
                    }
                }, 500);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const pages = await Engine.Request.fetchUI(request, script);
        return pages.map(element => this.createConnectorURI(this.getAbsolutePath(element.url, this.url)));
    }

    async _handleConnectorURI(payload) {
        const request = new Request(payload, this.requestOptions);
        request.headers.set('x-referer', this.url);
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}
