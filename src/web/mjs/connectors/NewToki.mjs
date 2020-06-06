import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NewToki extends Connector {

    constructor() {
        super();
        super.id = 'newtoki';
        super.label = 'NewToki';
        this.tags = [ 'manga', 'webtoon', 'korean' ];
        this.url = 'https://newtoki.com';
        this.path = [ '/webtoon', '/comic' ];
    }

    canHandleURI(uri) {
        return /https?:\/\/newtoki\d*.com/.test(uri.origin);
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
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        this.requestOptions.headers.set('x-referer', this.url);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
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
                await this.wait(2500);
                let mangas = await this._getMangasFromPage(path, page);
                mangaList.push(...mangas);
            }
        }
        return mangaList;
    }

    async _getMangasFromPage(path, page) {
        let script = `
            new Promise(resolve => {
                let mangas = [...document.querySelectorAll('section.board-list div.list-container ul.list div.list-item div.in-lable a')].map(a => {
                    return {
                        id: a.pathname,
                        title: a.text.trim()
                    };
                });
                setTimeout(() => resolve(mangas), 2500);
            });
        `;
        let uri = new URL(path + '/p' + page, this.url);
        let request = new Request(uri, this.requestOptions);
        let mangas = await Engine.Request.fetchUI(request, script);
        // HACK: Objects returned by fetchUI are lazy, therefore they will massively slow down or even freeze postprcessing such as removing duplicates
        //       Clone object with JSON to create a non-lazy obect ...
        return JSON.parse(JSON.stringify(mangas));
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
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
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'article div.view-content source');
        return data.map(element => this.getAbsolutePath(element.dataset.original, request.url));
    }
}