import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class RawDevart extends Connector {

    constructor() {
        super();
        super.id = 'rawdevart';
        super.label = 'Rawdevart';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://rawdevart.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.manga-top-info h1.title');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.pagination li:last-of-type a.page-link');
        let pageCount = parseInt(data[0].href.match(/\d+$/)[0]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + '/?page=' + page, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.card-body div.card div.overlay a.head');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.manga-body-right div.card-body div.list-group-item a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#img-container source');
        return data.map(element => this.getAbsolutePath(element.dataset.src, request.url));
    }
}