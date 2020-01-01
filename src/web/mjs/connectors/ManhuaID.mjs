import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ManhuaID extends Connector {

    constructor() {
        super();
        super.id = 'manhuaid';
        super.label = 'ManhuaID';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://manhuaid.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.container div.row div.col-md h6.text-uppercase');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(this.url + '/lists', this.requestOptions);
        let data = await this.fetchDOM(request, 'div.container div.row div.col-md a.text-success');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'table.table tbody tr td:first-of-type a.text-success');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.container div.row source.img-fluid');
        return data.map(element => this.getAbsolutePath(element.dataset.src || element, request.url));
    }
}