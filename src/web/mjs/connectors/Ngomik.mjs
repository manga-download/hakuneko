import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Ngomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'ngomik';
        super.label = 'Ngomik';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://ngomik.net';
        this.path = '/all-komik/';
    }

    async _initializeConnector() {
        // NOTE: Multiple domains may be protected by CloudFlare and needs to be unlocked ...
        const domains = [ this.url, 'https://cdn.ngomik.in', 'https://cdn2.ngomik.in' ];
        for(let domain of domains) {
            /*
             * sometimes cloudflare bypass will fail, because chrome successfully loads the page from its cache
             * => append random search parameter to avoid caching
             */
            let uri = new URL(domain);
            uri.searchParams.set('ts', Date.now());
            uri.searchParams.set('rd', Math.random());
            let request = new Request(uri.href, this.requestOptions);
            await Engine.Request.fetchUI(request, '', 60000, true);
        }
    }

    async _getMangas() {
        let mangaList = [];
        const request = new Request(new URL(this.path, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.pagination > a:nth-last-of-type(2)');
        const pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL(`${this.path}page/${page}/`, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.page div.listo div.bsx > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }
}