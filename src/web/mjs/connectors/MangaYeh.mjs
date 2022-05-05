import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaYeh extends Connector {

    constructor() {
        super();
        super.id = 'mangayeh';
        super.label = 'MangaYeh';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://mangayeh.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname;
        const title = (await this.fetchDOM(request, 'h1.title'))[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangaList = [];
        for(let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/category/all?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, '.column.is-9 div.columns > div > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('.mtitle').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#chapterList td:nth-child(1) a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim(),
                language: '',
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.column source');
        return data.map(element => element.dataset['src'] || element.src);
    }
}