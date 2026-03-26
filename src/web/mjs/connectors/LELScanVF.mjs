import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class LELScanVF extends Connector {

    constructor() {
        super();
        super.id = 'lelscanvf';
        super.label = 'LELSCAN-VF';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://lelscanfr.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const [data] = await this.fetchDOM(request, 'section source.object-cover');
        const id = uri.pathname;
        const title = data.getAttribute('alt').trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`/manga?page=${page}`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#card-real a');
        return data.map(element => {
            return {
                id: element.pathname,
                title: element.querySelector('source').getAttribute('alt').trim()
            };
        });
    }

    async _getChapters(manga) {
        const chapterlist = [];
        for (let page = 1, run = true; run; page++) {
            const chapters = await this._getChaptersFromPage(manga, page);
            chapters.length > 0 ? chapterlist.push(...chapters) : run = false;
        }
        return chapterlist;
    }

    async _getChaptersFromPage(manga, page) {
        const uri = new URL(`${manga.id}?page=${page}`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#chapters-list a');
        return data.map(element => {
            return {
                id: element.pathname,
                title: element.querySelector('span').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div#chapter-container source.chapter-image');
        return data.map(element => element.dataset.src);
    }
}
