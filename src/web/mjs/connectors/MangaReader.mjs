import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaReader extends Connector {

    constructor() {
        super();
        super.id = 'mangareader';
        super.label = 'MangaReader';
        this.tags = ['manga', 'english'];
        this.url = 'https://mangareader.tv';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'table tr td span.name');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let uri = new URL('/alphabetical', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.d46 li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'table tbody tr td:first-of-type a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.closest('td').textContent.replace(manga.title, '').replace(/:+\s*$/, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => {
                resolve(document.mj.im.map(item => new URL(item.u, window.location.origin).href));
            });
        `;
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}