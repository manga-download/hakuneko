import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

/*
 * Same as NetTruyen
 * Same as MangaNT
 */
export default class TruyenChon extends Connector {

    constructor() {
        super();
        super.id = 'truyenchon';
        super.label = 'TruyenChon';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.url = 'http://truyenchon.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]');
        let id = uri.pathname + uri.search;
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + '/?page=', this.requestOptions);
        let data = await this.fetchDOM(request, 'div.pagination-outter ul.pagination li:last-of-type a');
        let pageCount = parseInt(data[0].href.match(/\d+$/)[0]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + '/?page=' + page, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.ModuleContent div.items div.item figcaption a.jtip');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.list-chapter ul li.row div.chapter a');
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
        let data = await this.fetchDOM(request, 'div.reading div.page-chapter source');
        return data.map(element => {
            let uri = this.getAbsolutePath(element, request.url);
            return uri.includes('proxy.') ? this.createConnectorURI( { url: uri, referer: request.url } ) : uri;
        });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        const response = await fetch(request);
        const data = await response.blob();
        return this._blobToBuffer(data);
    }
}