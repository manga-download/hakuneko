import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ManhuaID extends Connector {

    constructor() {
        super();
        super.id = 'manhuaid';
        super.label = 'ManhuaID';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://manhuaid.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.container div.row div.col-md h6.text-uppercase');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
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
        const uri = new URL('/project?page_project=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.card div.row p.card-title a.text-success');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'table.table tbody tr td:first-of-type a.text-success');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.container div.row source.img-fluid');
        return data.map(element => this.getAbsolutePath(element.dataset.src || element, request.url));
    }
}