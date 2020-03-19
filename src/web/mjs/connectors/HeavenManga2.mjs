import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class HeavenManga2 extends Connector {

    constructor() {
        super();
        super.id = 'heavenmanga2';
        super.label = 'HeavenManga';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://heavenmanga.com';
    }

    async _initializeConnector() {
        /*
         * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
         * => append random search parameter to avoid caching
         */
        let uri = new URL(this.url);
        uri.searchParams.set('ts', Date.now());
        uri.searchParams.set('rd', Math.random());
        let request = new Request(uri.href, this.requestOptions);
        // website sometimes loads infinity (because of broken image links) => always resolve
        return Engine.Request.fetchUI(request, '').catch(() => Promise.resolve());
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.site-content div.post-title h3');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/top', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.page-content-listing ul.pagination li:nth-last-of-type(2) a');
        let pageCount = parseInt(data[0].href.match(/page=(\d+)/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/top?page=' + page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.page-item-detail div.photo a.thumbnail');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('source').getAttribute('alt').trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'table.table tr td h4.title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(/^[Ll]eer\s*/, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.post-content a#leer');
        let uri = this.getAbsolutePath(data[0], request.url);
        data = await this.fetchRegex(new Request(uri, this.requestOptions), /['"]imgURL['"]\s*:\s*['"]\s*([^'"]+?)\s*['"]/g);
        return data.map(image => this.getAbsolutePath(image, request.url));
    }
}