import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NewToki extends Connector {

    constructor() {
        super();
        super.id = 'newtoki';
        super.label = 'NewToki';
        this.tags = [ 'manga', 'webtoon', 'korean' ];
        this.url = 'https://newtoki38.com';
        /*
         * this.urlComic = 'https://newtoki38.net';
         * this.urlWebtoon = 'https://newtoki38.com';
         */

        this.path = [ '/webtoon', '/comic' ];
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.page-title span.page-desc');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let path of this.path) {
            let request = new Request(this.url + path, this.requestOptions);
            let data = await this.fetchDOM(request, 'section.board-list ul.pagination li:last-of-type a');
            let pageCount = parseInt(data[0].href.match(/\d+$/)[0]);
            for(let page = 1; page <= pageCount; page++) {
                let mangas = await this._getMangasFromPage(path, page);
                mangaList.push(...mangas);
            }
        }
        return mangaList;
    }

    async _getMangasFromPage(path, page) {
        let request = new Request(this.url + path + '/p' + page, this.requestOptions);
        let data = await this.fetchDOM(request, 'section.board-list div.list-container ul.list div.list-item div.in-lable a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.serial-list ul.list-body li.list-item');
        return data.map(element => {
            let link = element.querySelector('div.wr-subject a.item-subject');
            let number = element.querySelector('div.wr-num').textContent.trim();
            let title = link.childNodes[0].textContent.trim() || link.childNodes[2].textContent.trim();
            return {
                id: this.getRootRelativeOrAbsoluteLink(link, request.url),
                title: number + ' - ' + title.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'article div.view-content source');
        return data.map(element => this.getAbsolutePath(element.dataset.original, request.url));
    }
}