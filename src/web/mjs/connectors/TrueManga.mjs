import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class TrueManga extends Connector {
    constructor() {
        super();
        super.id = 'truemanga';
        super.label = 'TrueManga';
        this.tags = ['manga', 'webtoon', 'english'];
        this.url = 'https://truemanga.com';
        this.path = '/az-list?page=';
        this.queryMangaTitleFromURI = 'div.name.box h1';
        this.queryMangas = 'div.thumb a';
        this.queryPages = 'div.chapter-image';
        this.queryChapterTitle = 'strong.chapter-title';
    }
    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitleFromURI);
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }
    async _getMangas() {
        const mangaList = [];
        for(let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        const uri = new URL(this.path + page, this.url);
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
        let uri = new URL('/api/manga'+manga.id+'/chapters?source=detail', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'a');
        return data.map(element => {
            const link = element.pathname;
            const title = element.querySelector(this.queryChapterTitle).textContent.trim();
            return {
                id: link,
                title: title,
            };
        });
    }
    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        return data.map(ele => ele.children[0].dataset.src);
    }
}
