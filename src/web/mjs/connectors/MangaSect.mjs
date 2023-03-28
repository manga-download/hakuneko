import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaSect extends Connector {

    constructor() {
        super();
        super.id = 'mangasect';
        super.label = 'MangaSect';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mangasect.com';
        this.path = '/all-manga/';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'header h1');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL(this.path, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.blog-pager span:last-of-type a');
        const pageCount = parseInt(data[0].href.match(/\/(\d)+\//)[1]);
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.grid div.text-center > a');
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
        const data = await this.fetchDOM(request, 'li.chapter > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getPages(chapter) {
        const referer = new URL(chapter.id, this.url);
        const chapterid = chapter.id.match(/\/([\d]+)$/)[1];
        const uri = new URL ('/ajax/image/list/chap/' + chapterid, this.url);
        const request = new Request(uri, this.requestOptions);
        request.headers.set('x-referer', referer);
        request.headers.set('X-Requested-With', 'XMLHttpRequest');
        const response = await this.fetchJSON(request);
        const dom = this.createDOM(response.html);
        const data = dom.querySelectorAll('source[data-src]');
        return Array.from(data).map(image => this.getAbsolutePath(image.dataset['src'], request.url));
    }
}
