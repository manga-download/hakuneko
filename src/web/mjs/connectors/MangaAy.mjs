import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaAy extends Connector {

    constructor() {
        super();
        super.id = 'mangaay';
        super.label = 'Manga Ay';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://manga-ay.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.panel-heading > h3');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        const request = new Request(new URL('/seriler', this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'nav > ul > li:last-child > a');
        const pageCount = parseInt(data[0].href.match(/(\d+)$/)[1]);
        for(let page = 0; page <= pageCount; page+=100) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(`/seriler/${page}`, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'td:nth-child(2) > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.table-responsive a[title]');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').trim(),
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const response = await fetch(request);
        let data = await response.text();
        data = data.match(/var dataurl = '([^']*)';\svar page_array = \[([^\]]*),\];\svar server = '([^']*)';/);
        const pages = data[2].split(',');
        return pages.map(datt => `${this.url}${data[3]}/${data[1]}/${datt.trim().replace(/'/g, '')}`);
    }
}