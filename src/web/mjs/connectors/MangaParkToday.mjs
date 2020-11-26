import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaParkToday extends Connector {
    constructor() {
        super();
        super.id = 'mangaparktoday';
        super.label = 'MangaPark.Today';
        this.tags = [ '!test', 'manga', 'webtoon', 'english'];
        this.url = 'http://mangapark.today';

        this.path = '/latest-manga';
        this.queryMangas = 'div.row div.cate-manga div.col-md-6 div.media.mainpage-manga div.media-body > a';
        this.queryChapters = 'section#examples div.content.mCustomScrollbar div.chapter-list ul li.row div.chapter h4 a.xanh';
        this.queryPages = 'div.each-page #arraydata';
        this.queryMangaTitle = 'div.media-body h1.title-manga';
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path, this.url);
        uri.searchParams.set('page', page);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryChapters);
        return data.map(el => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(el, this.url),
                title: el.textContent.replace(manga.title, '').trim(),
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        return data[0].textContent.split(',').map(el => this.getAbsolutePath(el));
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitle);
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }
}