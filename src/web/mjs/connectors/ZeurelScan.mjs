import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ZeurelScan extends Connector {

    constructor() {
        super();
        super.id = 'zeurelscan';
        super.label = 'ZeurelScan';
        this.tags = [ 'manga', 'webtoon', 'italian' ];
        this.url = 'https://www.zeurelscan.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname + uri.search;
        const title = await this.fetchDOM(request, '.series-meta h1');
        return new Manga(this, id, title[0].textContent.trim());
    }

    async _getMangas() {
        const uri = new URL('/series', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.series-grid a.series-card');

        return data.map(element => {
            const title = element.querySelector('.series-title');

            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: title?.textContent.trim() ?? ''
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '.chapter a');

        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim().split('\n')[0].trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);

        const data = await this.fetchDOM(
            request,
            '.reader source[src*="/immagini/"]'
        );

        return data.map(image => {
            return this.getAbsolutePath(image, request.url);
        });
    }
}