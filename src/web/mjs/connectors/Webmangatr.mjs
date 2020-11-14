import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
//Movifox theme/template

export default class Webmangatr extends Connector {

    constructor() {
        super();
        super.id = 'webmangatr';
        super.label = 'WEBMANGATR';
        this.tags = ['turkish', 'webtoon', 'hentai'];
        this.url = 'https://webmangatr.com';
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + '/dizi-arsivi/', this.requestOptions);
        let data = await this.fetchDOM(request, 'div.col-lg-8 > a:last-of-type');
        let pageCount = parseInt(data[0].dataset.max);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(`${this.url}/dizi-arsivi/page/${page}/`, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.movie-details > div.name > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'h1.film');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => resolve( [...document.querySelectorAll('p > img[loading]')].map(image => image.dataset.src)))
        `;
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await Engine.Request.fetchUI(request, script);
        return data;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.movie-details > div.name > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').trim()
            };
        });
    }
}