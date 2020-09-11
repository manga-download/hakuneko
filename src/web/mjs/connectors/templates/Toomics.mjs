import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class Toomics extends Connector {

    constructor() {
        super();
        super.id = 'toomics';
        super.label = 'Toomics';
        this.tags = [];
        this.url = '';
        this.baseURL = 'https://global.toomics.com';

        this.path = '/';
        this.queryMangaHeading = 'section.ep-header_ch div.title_content h1';
        this.queryMangas = 'div.section_ongoing div.list_wrap ul li > div.visual > a';
        this.queryMangaTitle = 'div.main_text h4.title';
        this.queryChapters = '.ep-body .list-ep li:not(.chk_ep) a';
        this.queryPages = '#viewer-img source';
    }

    get icon() {
        return '/img/connectors/toomics';
    }

    async _initializeConnector() {
        /*
         * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
         * => append random search parameter to avoid caching
         */
        let uri = new URL('/index/set_display/?display=A', this.url);
        uri.searchParams.set('ts', Date.now());
        uri.searchParams.set('rd', Math.random());
        let request = new Request(uri.href, this.requestOptions);
        return Engine.Request.fetchUI(request, '');
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangaHeading);
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let uri = new URL(this.path, this.baseURL);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.baseURL).match(/.+\/toon\/\d+/)[0],
                title: element.querySelector(this.queryMangaTitle).innerText.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.baseURL);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data
            .filter(element => element.querySelector('div.cell-title') && !element.querySelector('div.thumb span.lock'))
            .map(element => {
                let action = element.getAttribute('onclick');
                if(action.includes('location.href=')) {
                    element.href = action.match(/href='([^']+)'/)[1];
                } else {
                    element.href = action.match(/popup\s*\(\s*'[^']+'\s*,\s*'[^']*'\s*,\s*'([^']+)'/)[1];
                }
                let chapter = element.querySelector('div.cell-id, div.cell-num').innerText.trim();
                //let title = element.querySelector('div.cell-title').innerText.replace(manga.title, '').trim();
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.baseURL),
                    title: 'Chapter: ' + chapter,
                    language: ''
                };
            });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.baseURL);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => this.createConnectorURI(this.getAbsolutePath(element.dataset['src'] || element.dataset['original'], this.baseURL)));
    }

    async _handleConnectorURI(payload) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        this.requestOptions.headers.set('x-referer', new URL(payload).origin);
        let promise = super._handleConnectorURI(payload);
        this.requestOptions.headers.delete('x-referer');
        return promise;
    }
}