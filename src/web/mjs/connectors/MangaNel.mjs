import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaNel extends Connector {

    constructor() {
        super();
        super.id = 'manganel';
        super.label = 'Manganato';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://www.manganato.gg/';

        this.path = '/genre/all';
        this.mangaTitleFilter = /(\s+manga|\s+webtoon|\s+others)+\s*$/gi;
        this.chapterTitleFilter = /^\s*(\s+manga|\s+webtoon|\s+others)+/gi;
        this.queryMangaTitle = 'div.main-wrapper div.leftCol div.manga-info-top h1';
        this.queryMangasPageCount = 'div.panel_page_number div.group_page a.page_last:last-of-type';
        this.queryMangas = 'div.truyen-list div.list-truyen-item-wrap h3 a';

        this._queryChapters = [
            'section#chapter-list table tbody tr a', // manganeloinfo
            'div.chapter-list div.row span a', // mangabat, manganato, mangakakalot
        ].join(', ');

        this._queryPages = [
            'div.container-chapter-reader source', // manganato, mangabat, mangakakalot
            'div.my-5 div source', // manganeloinfo
        ].join(', ');
    }

    canHandleURI(uri) {
        return /^(www\.)?manganato\.gg$/.test(uri.hostname);
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangaTitle);
        let id = uri.href;
        let title = data[0].textContent.replace(this.mangaTitleFilter, '').trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let uri = new URL(this.path, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangasPageCount);
        let pageCount = parseInt(data[0].href.match(/\d+$/));
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL(this.path + "?page=" + page, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                // get absolute links to support cross referencing between MangaNato affiliates and sub-domains
                id: this.getAbsolutePath(element, request.url),
                title: element.text.replace(this.mangaTitleFilter, '').trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this._queryChapters);
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                // get absolute links to support cross referencing between MangaNato affiliates and sub-domains
                id: this.getAbsolutePath(element, request.url),
                title: element.text.replace(manga.title, '').replace(this.chapterTitleFilter, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this._queryPages);
        return data.map(element => this.createConnectorURI({
            url: this.getAbsolutePath(element.dataset['src'] || element, request.url),
            referer: request.url
        }));
    }

    async _handleConnectorURI(payload) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        this.requestOptions.headers.set('x-referer', this.url);
        let promise = super._handleConnectorURI(payload.url);
        this.requestOptions.headers.delete('x-referer');
        return promise;
    }
}
