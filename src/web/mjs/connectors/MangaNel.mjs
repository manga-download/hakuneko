import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaNel extends Connector {

    constructor() {
        super();
        super.id = 'manganel';
        super.label = 'Manganato';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manganato.com';

        this.path = '/genre-all/';
        this.mangaTitleFilter = /(\s+manga|\s+webtoon|\s+others)+\s*$/gi;
        this.chapterTitleFilter = /^\s*(\s+manga|\s+webtoon|\s+others)+/gi;
        this.queryMangaTitle = 'div.container-main div.panel-story-info div.story-info-right h1';
        this.queryMangasPageCount = 'div.panel-page-number div.group-page a.page-last:last-of-type';
        this.queryMangas = 'div.genres-item-info h3 a.genres-item-name';

        this._queryChapters = [
            'ul.row-content-chapter li a.chapter-name', // manganato, mangabat
            'div.chapter_list ul li a', // mangairo
            'div.chapter-list div.row span a', // mangakakalot(s), kissmangawebsite, manganeloinfo
            'div.content.mCustomScrollbar div.chapter-list ul li.row div.chapter h4 a.xanh' // MangaPark
        ].join(', ');

        this._queryPages = [
            'div.container-chapter-reader source', // manganato, mangabat
            'div.chapter-content div.panel-read-story source', // mangairo
            'div#vungdoc source, div.vung-doc source, div.vung_doc source' // mangakakalot(s), kissmangawebsite, manganeloinfo
        ].join(', ');
    }

    canHandleURI(uri) {
        // Test: https://regex101.com/r/aPR3zy/3/tests
        return /^(chap|read)?manganato\.(com|to)$/.test(uri.hostname);
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
        let uri = new URL(this.path + '1', this.url);
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
        let uri = new URL(this.path + page, this.url);
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
        this.requestOptions.headers.set('x-referer', payload.referer);
        let promise = super._handleConnectorURI(payload.url);
        this.requestOptions.headers.delete('x-referer');
        return promise;
    }
}
