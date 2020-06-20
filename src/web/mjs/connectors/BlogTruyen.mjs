import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class BlogTruyen extends Connector {

    constructor() {
        super();
        super.id = 'blogtruyen';
        super.label = 'BlogTruyen';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.url = 'https://blogtruyen.vn';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'section.manga-detail h1.entry-title');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/danhsach/tatca', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'section.list-manga-bycate div.paging span.page:last-of-type a');
        let pageCount = parseInt(data[0].href.match(/\d+/).pop().trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL('/ajax/Search/AjaxLoadListManga?key=tatca&orderBy=1&p=4', this.url);
        uri.searchParams.set('key', 'tatca'); // show all
        uri.searchParams.set('orderBy', 1); // order by title
        uri.searchParams.set('p', page);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.list p span.tiptip a', 3);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#list-chapters span.title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'article#content source');
        return data.map(element => {
            let payload = {
                url: this.getAbsolutePath(element, request.url),
                referer: request.url
            };
            return this.createConnectorURI(payload);
        });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        let data = await response.blob();
        return this._blobToBuffer(data);
    }
}