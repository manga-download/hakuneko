import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ElevenToon extends Connector {

    constructor() {
        super();
        super.id = '11toon';
        super.label = '11toon';
        this.tags = ['manga', 'korean'];
        this.url = 'http://www.11toon.com';
    }

    canHandleURI(uri) {
        return /https?:\/\/www\.11toon\d*\.com/.test(uri.origin);
    }

    async _initializeConnector() {
        let uri = new URL(this.url);
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, '#cover-info h2');
        const title = data[0].textContent.trim();
        return new Manga(this, uri.pathname + uri.search, title);
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + '/bbs/board.php?bo_table=toon_c&type=upd&page=' + page, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.homelist li a div.homelist-title span', 5);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), request.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + '/bbs/board.php?bo_table=toon_c&type=upd&page=', this.requestOptions);
        let data = await this.fetchDOM(request, 'main.main nav.pg_wrap span.pg a.pg_end');
        let pageCount = parseInt(data[0].href.match(/\d+$/)[0]);
        for (let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getChaptersFromPages(manga, page) {
        let url = new URL(manga.id, this.url);
        url.searchParams.set('page', page);
        let request = new Request(url, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul#comic-episode-list li button.episode', 5);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.getAttribute('onclick').split('\'')[1], request.url),
                title: element.querySelector('div.episode-title').textContent.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri.href, this.requestOptions);
        let data = await this.fetchDOM(request, 'nav.pg_wrap span.pg a.pg_end');
        let pageCount = data[0] ? parseInt(data[0].href.match(/\d+$/)[0]) : 1;
        for (let page = 1; page <= pageCount; page++) {
            let chapters = await this._getChaptersFromPages(manga, page);
            chapterList.push(...chapters);
        }
        return chapterList;
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        return Engine.Request.fetchUI(request, `new Promise( resolve => resolve( img_list ) )`);
    }

}