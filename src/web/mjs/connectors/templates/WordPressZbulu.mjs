import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class WordPressZbulu extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.path = '/manga-list/';
        this.pathMangas = this.path + 'page-%PAGE%/';
        this.pathChapters = '/page-%PAGE%/';

        this.queryManga = 'div.comic-info div.info h1.name';
        this.queryMangasPageCount = 'div.pagination-container div.pagination a.next:last-of-type';
        this.queryMangas = 'div.comics-grid div.entry div.content h3.name a';
        this.queryChaptersPageCount = 'div.pagination-container div.pagination a.next:last-of-type';
        this.queryChapters = 'div#chapterList div.chapters-wrapper div.r1 h2.chap a';
        this.queryPages = 'div.chapter-content-inner source';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryManga);
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + this.path, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangasPageCount);
        let pageCount = parseInt(data[0].href.match(/(\d+)$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + this.pathMangas.replace('%PAGE%', page), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: new URL(element.href, request.url).pathname,
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChaptersPageCount);
        let pageCount = data.length === 0 ? 1 : parseInt(data[0].href.match(/(\d+)$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let chapters = await this._getChaptersFromPage(manga, page);
            chapterList.push(...chapters);
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        let request = new Request(this.url + manga.id + this.pathChapters.replace('%PAGE%', page), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: new URL(element.href, request.url).pathname,
                title: element.text.replace(manga.title, '').trim(),
                language: 'en'
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}