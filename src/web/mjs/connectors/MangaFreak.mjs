import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaFreak extends Connector {

    constructor() {
        super();
        super.id = 'mangafreak';
        super.label = 'MangaFreak';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangafreak.me';
    }

    canHandleURI(uri) {
        return /https?:\/\/w+\d*.mangafreak.me/.test(uri.origin);
    }

    async _initializeConnector() {
        let uri = new URL(this.url);
        let request = new Request(uri.href, this.requestOptions);
        this.url = await Engine.Request.fetchUI(request, `window.location.origin`);
        console.log(`Assigned URL '${this.url}' to ${this.label}`);
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.manga_series_info div.manga_series_data h5');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let uri = new URL('/Mangalist/All', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.list_main div.pagination a.last_p');
        let pageCount = parseInt(data[0].href.match(/\d+$/)[0]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL('/Mangalist/All/' + page, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.list_main div.list_item_info h3 a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.manga_series_list table tbody tr td:first-of-type a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.read_image div.mySlides source');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}
