import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaItalia extends Connector {

    constructor() {
        super();
        super.id = 'manga-italia';
        super.label = 'Manga Italia';
        this.tags = [ 'manga', 'webtoon', 'italian' ];
        this.url = 'https://manga-italia.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname + uri.search;
        const title = await this.fetchDOM(request, '.col > h1');
        return new Manga(this, id, title[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/manga?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.grid-item-series');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a'), this.url),
                title: element.querySelector('.item-title').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.col-chapter');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a'), this.url),
                title: element.querySelector('h5').textContent.trim().split('\n')[0],
            };
        });
    }

    async _getPages(chapter) {
        let pageList = [];
        for (let page = 1, run = true; run; page++) {
            const pages = await this._getPage(chapter, page);
            pages.length > 0 ? pageList.push(...pages) : run = false;
        }
        return pageList;
    }

    async _getPage(chapter, page) {
        const uri = new URL(chapter.id + '/' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.book-page source');
        return data.map(x => x.src);
    }
}