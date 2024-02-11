import FlatManga from './templates/FlatManga.mjs';

export default class MangaTR extends FlatManga {

    constructor() {
        super();
        super.id = 'mangatr';
        super.label = 'Manga-TR';
        this.tags = [ 'manga', 'turkish' ];
        this.url = 'https://manga-tr.com';
        this.path = '/manga-list.html';
        this.queryMangaTitle = 'meta[property="og:title"]';
        this.queryMangas = 'div.container a[data-toggle="mangapop"]';
        this.requestOptions.headers.set('x-referer', this.url);
        this.requestOptions.headers.set('x-cookie', 'read_type=1');
    }

    async _initializeConnector() {
        for(let path of [this.path, '/manga-list.html']) {
            const uri = new URL(path, this.url);
            const request = new Request(uri, this.requestOptions);
            return Engine.Request.fetchUI(request, '', 30000, true);
        }
    }

    async _getMangaFromURI(uri) {
        const manga = await super._getMangaFromURI(uri);
        manga.title = manga.title.split(' - ').shift().trim();
        return manga;
    }

    async _getChapters(manga) {
        let chapterList = [];
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchRegex(request, /"([^"]*cek\/fetch_pages_manga.php\?manga_cek=[^"]*)"/g);
        request = new Request(new URL(data[0], this.url), this.requestOptions);
        request.headers.set('x-requested-with', 'XMLHttpRequest');
        data = await this.fetchDOM(request, 'ul.pagination1 li:last-of-type a');
        const pageCount = data.length > 0 ? parseInt(data.pop().dataset.page) : 1;
        for(let page = 1; page <= pageCount; page++) {
            let chapters = await this._getChaptersFromPage(manga, request.url, page);
            chapterList.push(...chapters);
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, action, page) {
        const request = new Request(action, {
            method: 'POST',
            body: 'page=' + page,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-requested-with': 'XMLHttpRequest'
            }
        });
        const data = await this.fetchDOM(request, 'table.table tr td.table-bordered:first-of-type > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(manga.title, '').trim()
            };
        });
    }
}
