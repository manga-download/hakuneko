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
        this.path = '/list/';
        this.pathMatch = '/list_(\\d+)/';
        this.queryManga = 'div.book-cont div.book-detail div.book-title h1';
        this.queryMangasPageCount = 'div.page-container ul.pagination li.last a';
        this.queryMangas = 'ul#contList li p.ell a';
        this.queryChapters = 'div.comic-chapters ul li a';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryManga);
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + this.path, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangasPageCount);
        let pageCount = parseInt(new RegExp(this.pathMatch).exec(data[0].href)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + this.pathMatch.replace('(\\d+)', page), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let script = `
            new Promise(resolve => {
                let button = document.querySelector('#checkAdult');
                if(button) {
                    button.click();
                }
                chapterList = [...document.querySelectorAll('${this.queryChapters}')].map(element => {
                    return {
                        id: new URL(element.href, window.location).pathname,
                        title: element.text.trim(),
                        language: ''
                    };
                });
                resolve(chapterList);
            });
        `;
        let request = new Request(this.url + manga.id, this.requestOptions);
        return await Engine.Request.fetchUI(request, script);
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => {
                let pageList = [];
                let pages = ${this.api}.getChapterImageCount();
                for(let page = 1; page <= pages; page++) {
                    pageList.push(${this.api}.getChapterImage(page));
                }
                resolve(pageList);
            });
        `;
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        return data.map(page => this.createConnectorURI(page));
    }
}