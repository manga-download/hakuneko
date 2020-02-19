import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

// very similar to WordPressEManga
export default class KoMBatch extends Connector {

    constructor() {
        super();
        super.id = 'kombatch';
        super.label = 'KoMBatch';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://kombatch.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.infox h1[itemprop="headline"]');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/manga-list', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.pagination li.page-item:nth-last-of-type(2) a.page-link');
        let pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/manga-list?page=' + page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.trending div.box_trending a._2dU-m.vlQGQ');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request( this.url + manga.id, this.requestOptions );
        let data = await this.fetchDOM(request, 'div.bxcl ul li span.lchx.desktop a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        uri.pathname = uri.pathname.replace('read/', 'api/chapter/');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.chapter.images.map(image => this.getAbsolutePath(image.text, this.url));
    }
}