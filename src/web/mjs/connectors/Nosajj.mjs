import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Nosajj extends Connector {

    constructor() {
        super();
        super.id = 'Nosajj';
        super.label = 'Nosajj (shonanjunaigumi)';
        this.tags = ['manga', 'english', 'scanlation'];
        this.url = 'http://shonanjunaigumi.weebly.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname + uri.search;
        const title = (await this.fetchDOM(request, 'div.paragraph'))[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const uri = new URL('/projects.html', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'td[align^="center"] > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = (await this.fetchDOM(request, 'td.wsite-multicol-col'))[0].querySelectorAll('a');
        return Array.from(data).filter(element => element.textContent.includes("Chapter")).map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim(),
                language: '',
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.wsite-image>a>source');
        return Array.from(data).map(element => this.url + new URL(element.src).pathname);
    }
}