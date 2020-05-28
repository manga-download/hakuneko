import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class GnuBoard5BootstrapBasic2 extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;

        this.path = [ '/웹툰/연재?fil=제목', '/웹툰/완결?fil=제목' ];
        this.queryManga = 'meta[property="og:title"]';
        this.queryMangas = 'div#wt_list .section-item div.section-item-title a#title';
        this.queryChapters = 'div#bo_list table.web_list tbody tr td.content__title';
        this.scriptPages = `
            new Promise(resolve => {
                resolve([...document.querySelectorAll('div#toon_img img')].map(img => img.src));
            });
        `;
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryManga);
        let id = uri.pathname + uri.search;
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map( element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink( element, request.url ),
                title: element.text.trim()
            };
        });
    }

    async _getMangas() {
        let mangaList = [];
        for(let page of this.path) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.dataset.role, request.url),
                title: element.textContent.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        return Engine.Request.fetchUI(request, this.scriptPages);
    }
}