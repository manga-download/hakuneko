import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Hentai2Read extends Connector {

    constructor() {
        super();
        super.id = 'hentai2read';
        super.label = 'Hentai2R';
        this.tags = [ 'hentai', 'english' ];
        super.isLocked = false;
        this.url = 'https://hentai2read.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'main div.content span[itemprop="name"]');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/hentai-list', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.pagination li:nth-last-child(2) a');
        const pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`/hentai-list/all/any/all/name-az/${page}/`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.book-grid div.overlay div.overlay-title a');
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
        const data = await this.fetchDOM(request, 'ul.nav-chapters li div.media > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.firstChild.textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchRegex(request, /['"]images['"]\s*:\s*(\[[^\]]*?\])/g);
        return JSON.parse(data[0]).map(image => 'https://static.hentaicdn.com/hentai' + image);
    }
}