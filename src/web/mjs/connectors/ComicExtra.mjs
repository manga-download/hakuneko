import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ComicExtra extends Connector {

    constructor() {
        super();
        super.id = 'comicextra';
        super.label = 'ComicExtra';
        this.tags = ['comic', 'english'];
        this.url = 'https://comicextra.org';
        this.path = '/comic-list/';
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL(this.path + 'others', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.general-nav a');
        const pages = data.map(element => {
            return this.getRootRelativeOrAbsoluteLink(element, request.url);
        });

        for(let page of pages) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.home-list .hl-box .hlb-t a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.title-1');
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#list tr td a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(this.url + chapter.id + '/full', this.requestOptions);
        const data = await this.fetchDOM(request, 'div.chapter-container source');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}
