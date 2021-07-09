import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ArangScans extends Connector {

    constructor() {
        super();
        super.id = 'arangscans';
        super.label = 'Arang Scans';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://arangscans.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[property="og:title"]');
        return new Manga(this, uri.pathname, data[0].content.trim());
    }

    async _getMangas() {
        const uri = new URL('/titles', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.content h4.header a');
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
        const data = await this.fetchDOM(request, 'div#chapters p.header a[href*="/read"]');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id.replace('/read', '/json'), this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.pages.map(entry => this.getAbsolutePath(entry.address, request.url));
    }
}