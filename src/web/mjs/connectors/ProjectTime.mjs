import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ProjectTime extends Connector {

    constructor() {
        super();
        super.id = 'projecttime';
        super.label = 'Project Time';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://ptscans.tw';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[property="og:title"]');
        return new Manga(this, uri.pathname, data[0].content.replace(/^PtScans\s+\|\s*/i, '').trim());
    }

    async _getMangas() {
        const uri = new URL('/manga', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.uk-list li h3.uk-card-title');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.parentElement.querySelector('p[uk-margin] a'), this.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.uk-list li a.uk-link-reset');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul li div.uk-panel > source');
        return data.map(image => this.getAbsolutePath(image.dataset.src, request.url));
    }
}