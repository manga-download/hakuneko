import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class HentaiFox extends Connector {

    constructor() {
        super();
        super.id = 'hentaifox';
        super.label = 'HentaiFox';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://hentaifox.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.gallery_right div.info h1', 3);
        let id = uri.pathname;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.pagination li:nth-last-of-type(2) a.page-link');
        let pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(`${this.url}/pag/${page}/`, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.lc_galleries div.thumb div.caption h2.g_title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        return [ {
            id: manga.id,
            title: manga.title,
            language: ''
        } ];
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.gallery_thumb div.g_thumb a source');
        return data.map(element => this.getAbsolutePath(element.dataset['src'] || element, request.url).replace('t.', '.'));
    }
}