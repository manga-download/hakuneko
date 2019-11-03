import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class LireScan extends Connector {

    constructor() {
        super();
        super.id = 'lirescan';
        super.label = 'LireScan';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://www.lirescan.me';

        this.path = '/zusun-lecture-en-ligne/';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'select#mangas option[selected="selected"]');
        let id = this.getRootRelativeOrAbsoluteLink(data[0].value, request.url);
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(this.url + this.path, this.requestOptions);
        let data = await this.fetchDOM(request, 'select#mangas option');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.value, request.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'select#chapitres option');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.value, request.url),
                title: element.textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.pagination li a');
        data = data.filter(a => !isNaN(a.text)).pop();
        let path = new URL(data.href).pathname.replace(/\d+\/?$/, '');
        let pageCount = parseInt(data.text);
        return [...new Array(pageCount).keys()].map(page => {
            page++;
            let url = this.getAbsolutePath(path + page, request.url);
            return this.createConnectorURI(url);
        });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        let data = await this.fetchDOM(request, 'a#imglink source#image_scan');
        request = new Request(this.getAbsolutePath(data[0], payload));
        let response = await fetch(request);
        return {
            mimeType: response.headers.get('content-type'),
            data: new Uint8Array(await response.arrayBuffer())
        };
    }
}