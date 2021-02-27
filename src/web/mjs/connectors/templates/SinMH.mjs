import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class SinMH extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.url = undefined;
        this.requestOptions.headers.set('x-cookie', 'isAdult=1');

        this.api = 'SinMH';
        this.path = '/list_%PAGE%/';
        this.queryManga = 'div.book-cont div.book-detail div.book-title h1';
        this.queryMangasPageCount = 'div.page-container ul.pagination li.last a';
        this.queryMangasPageCountMatch = /(\d+)(\/|\.html)?$/;
        this.queryMangas = 'ul#contList li p.ell a';
        this.queryChapters = 'div.comic-chapters ul li a';
        this.queryChaptersScript = undefined;
        this.queryPagesScript = undefined;
    }

    get _queryChaptersScript() {
        return this.queryChaptersScript || `
            new Promise(resolve => {
                let button = document.querySelector('#checkAdult');
                if(button) {
                    button.click();
                }
                let chapterList = [...document.querySelectorAll('${this.queryChapters}')].map(element => {
                    return {
                        id: new URL(element.href, window.location).pathname,
                        title: element.text.trim().replace(/\\d+p$/, ''),
                        language: ''
                    };
                });
                resolve(chapterList);
            });
        `;
    }

    get _queryPagesScript() {
        return this.queryPagesScript || `
            new Promise(resolve => {
                let pageList = [];
                let pages = ${this.api}.getChapterImageCount();
                for(let page = 1; page <= pages; page++) {
                    pageList.push(${this.api}.getChapterImage(page));
                }
                resolve(pageList);
            });
        `;
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryManga);
        const id = uri.pathname + uri.search;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL(this.path.replace('%PAGE%', 1), this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangasPageCount);
        const pageCount = parseInt(data[0].href.match(this.queryMangasPageCountMatch)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path.replace('%PAGE%', page), this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas, 3);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return await Engine.Request.fetchUI(request, this._queryChaptersScript);
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, this._queryPagesScript);
        return data.map(page => this.createConnectorURI(page));
    }
}