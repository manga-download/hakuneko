import YoungChampion from './YoungChampion.mjs';

export default class Yanmaga extends YoungChampion {
    constructor() {
        super();
        super.id = 'yanmaga';
        super.label = 'Yanmaga';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://yanmaga.jp';
        this.apiUrl = 'https://api2-yanmaga.comici.jp';
        this.links = {
            login: 'https://yanmaga.jp/customers/sign-in'
        };

        this.mangaListPath = '/series/list?page={page}';
        this.queryMangaTitleURI = '.detailv2-outline-title';
    }

    async _getMangas() {
        const request = new Request(new URL('comics', this.url));
        const data = await this.fetchDOM(request, '.ga-comics-book-item');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('.mod-book-title').textContent.trim(),
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri);
        const dom = await this.fetchDOM(request);
        const csrfToken = dom.querySelector('meta[name=csrf-token]').content;
        const contents = dom.querySelector('#contents');
        const count = contents ? Math.ceil(contents.dataset.count / 50) : 1;
        const chapters = [];
        for (let i = 0; i < count; i++) {
            const epUri = new URL(`${manga.id}/episodes`, this.url);
            epUri.searchParams.set('offset', String(i * 50));
            epUri.searchParams.set('cb', Date.now());
            const epRequest = new Request(epUri);
            epRequest.headers.set('x-csrf-token', csrfToken);
            const matches = await this.fetchRegex(epRequest, /'beforeend', "(.*)"/g);
            for (const value of matches) {
                if (!value.includes('<a class')) {
                    continue;
                }
                const content = value.replace(/\\'/g, '\'').replace(/\\"/g, '"').replace(/\\\//g, '/');
                const dom = this.createDOM(content);
                const anchorElement = dom.querySelector('a.mod-episode-link');
                chapters.push({
                    id: this.getRootRelativeOrAbsoluteLink(anchorElement, this.url),
                    title: dom.querySelector('.mod-episode-title').textContent.trim(),
                });
            }
        }
        return chapters;
    }

    _fetchCoordInfo(viewer) {
        const uri = new URL('/book/coordinateInfo', this.apiUrl);
        uri.searchParams.set('comici-viewer-id', viewer.getAttribute('comici-viewer-id'));
        const request = new Request(uri);
        request.headers.set('x-origin', this.url);
        request.headers.set('x-referer', this.url);
        return this.fetchJSON(request);
    }

}
