import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NewToki extends Connector {

    constructor() {
        super();
        super.id = 'newtoki';
        super.label = 'NewToki';
        this.tags = [ 'manga', 'webtoon', 'korean' ];
        this.url = 'https://newtoki.com'; // https://newtoki.net
        this.path = [ '/webtoon', '/comic' ];

        this._initializeConnector();
    }

    async _initializeConnector() {
        /*
         * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
         * => append random search parameter to avoid caching
         */
        let uri = new URL(this.url);
        uri.searchParams.set('ts', Date.now());
        uri.searchParams.set('rd', Math.random());
        let request = new Request(uri, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, 'new Promise(resolve => resolve(window.location.origin))');
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.page-title span.page-desc');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let path of this.path) {
            let uri = new URL(path, this.url);
            let request = new Request(uri, this.requestOptions);
            let data = await this.fetchDOM(request, 'section.board-list ul.pagination li:last-of-type a');
            let pageCount = parseInt(data[0].href.match(/\d+$/)[0]);
            for(let page = 1; page <= pageCount; page++) {
                await this.wait(5000);
                let mangas = await this._getMangasFromPage(path, page);
                mangaList.push(...mangas);
            }
        }
        return mangaList;
    }

    async _getMangasFromPage(path, page) {
        let uri = new URL(path + '/p' + page, this.url);
        let request = new Request(uri, this.requestOptions);
        request.headers.set('x-referer', new URL(path, this.url).href);
        let data = await this.fetchDOM(request, 'section.board-list div.list-container ul.list div.list-item div.in-lable a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.serial-list ul.list-body li.list-item');
        return data.map(element => {
            let link = element.querySelector('div.wr-subject a.item-subject');
            let number = element.querySelector('div.wr-num').textContent.trim();
            let title = link.childNodes[0].textContent.trim() || link.childNodes[2].textContent.trim();
            return {
                id: this.getRootRelativeOrAbsoluteLink(link, request.url),
                title: number + ' - ' + title.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'article div.view-content source');
        return data.map(element => this.getAbsolutePath(element.dataset.original, request.url));
    }
}