import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class LewdManhwa extends Connector {

    constructor() {
        super();
        super.id = 'lewdmanhwa';
        super.label = 'LewdManhwa';
        this.tags = [ 'hentai', 'english' ];
        this.url = 'https://lewdmanhwa.com';

        this.path = '/webtoons/';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'main#main header.entry-header h1.entry-title');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + this.path, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#content div.wp-pagenavi a.last');
        let pageCount = parseInt(data[0].href.match(/\d+\/$/)[0]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + this.path + 'page/' + page + '/', this.requestOptions);
        let data = await this.fetchDOM(request, 'div#content div.is-list-card div.column a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('div.card-content h4.entry-title').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapter-list div.chapter-list-items a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('span.chapter-name').textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'span.single-comic-page source');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}