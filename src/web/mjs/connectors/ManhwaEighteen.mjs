import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ManhwaEighteen extends Connector {

    constructor() {
        super();
        super.id = 'manhwa18-int';
        super.label = 'Manhwa 18 (.net)';
        this.tags = [ 'hentai', 'multi-lingual' ];
        this.url = 'https://manhwa18.net';
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/manga-list', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'a.paging_item.paging_prevnext.next');
        const pageCount = parseInt(data[0].href.match(/page=([\d]+)/)[1]);
        for (let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + '/manga-list?page=' + page, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.series-title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {

        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.list-chapters a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('div.chapter-name').textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#chapter-content source.lazy');
        return data.map(element => this.getAbsolutePath(element.dataset.src || element, request.url));
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]');
        let id = uri.pathname;
        let title = (data[0].content || data[0].textContent).trim();
        return new Manga(this, id, title);
    }
}
