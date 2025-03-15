import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaNeloInfo extends Connector {

    constructor() {
        super();
        super.id = 'manganeloinfo';
        super.label = 'MangaNeloInfo';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manganelo.info';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'section div.flex div.grow h1');
        const title = data[0].textContent;
        return new Manga(this, uri.pathname, title);
    }

    async _getMangas() {
        const mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL("/genre?page=" + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.grid h3.truncate a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'section#chapter-list table tbody tr a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, ''),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.my-5 div source');
        return data.map(element => this.createConnectorURI({
            url: this.getRootRelativeOrAbsoluteLink(element.dataset['src'] || element, request.url),
            referer: request.url
        }));
    }

    async _handleConnectorURI(payload) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        this.requestOptions.headers.set('x-referer', new URL(this.url).href);
        let promise = super._handleConnectorURI(payload.url);
        this.requestOptions.headers.delete('x-referer');
        return promise;
    }
}
