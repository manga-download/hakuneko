import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class TRWebtoon extends Connector {

    constructor() {
        super();
        super.id = 'trwebtoon';
        super.label = 'TR Webtoon';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://trwebtoon.com';
        this.links = {
            login: 'https://trwebtoon.com/panel/giris'
        };
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#movie-card h2.movie__title');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/webtoon-listesi?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.page-content div.card div.card-body div.table-responsive a.text-hover-primary');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'table#chapters tbody tr td:first-of-type a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.replace(/\s{2,}/g, ' ').trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#images source');
        return data.map(image => this.getAbsolutePath(image.dataset.src, request.url));
    }
}