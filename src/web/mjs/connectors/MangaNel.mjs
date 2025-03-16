import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaNel extends Connector {

    constructor() {
        super();
        super.id = 'manganel';
        super.label = 'Manganato';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.manganato.gg';

        this.path = '/genre/all';
        this.mangaTitleFilter = /(\s+manga|\s+webtoon|\s+others)+\s*$/gi;
        this.chapterTitleFilter = /^\s*(\s+manga|\s+webtoon|\s+others)+/gi;
        this.queryMangaTitle = 'div.manga-info-top h1';
        this.queryMangas = 'div.list-truyen-item-wrap h3 a';

        this._queryChapters = 'div.chapter-list div.row span a'; // mangabat, manganato, mangakakalot
        this._queryPages = 'div.container-chapter-reader source'; // manganato, mangabat, mangakakalot
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitle);
        const title = data[0].textContent.replace(this.mangaTitleFilter, '').trim();
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
        const uri = new URL(this.path + "?page=" + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
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
        const data = await this.fetchDOM(request, this._queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').replace(this.chapterTitleFilter, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this._queryPages);
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
