import WordPressMadara from './templates/WordPressMadara.mjs';
import Manga from '../engine/Manga.mjs';

// WordPressMadara clone without running WordPress ...
export default class Manga18FX extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manga18fx';
        super.label = 'Manga18fx';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'english', 'korean' ];
        this.url = 'https://manga18fx.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.post-title > h1');
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const lastID = list => list.length ? list[list.length - 1].id : null;
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 && lastID(mangas) !== lastID(mangaList) ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL('/page/' + page, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.bixbox div.listupd div.bigor-manga h3 a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div#chapterlist ul li a.chapter-name');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.read-manga div.read-content > source, div.read-manga div.read-content div.page-break source');
        return data.map(image => this.createConnectorURI({
            url: this.getAbsolutePath(image, request.url),
            referer: request.url
        }));
    }
}