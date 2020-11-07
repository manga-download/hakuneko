import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaPill extends Connector {

    constructor() {
        super();
        super.id = 'mangapill';
        super.label = 'Mangapill';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://mangapill.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.container h1.text-header-primary');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        const uri = new URL('/search', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.container div.grid div.mt-2 a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'select[name="view-chapter"] option[value]');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.value, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'picture source.lazy');
        return data.map(element => this.getAbsolutePath(element.dataset.src, request.url));
    }
}