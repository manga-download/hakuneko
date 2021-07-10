import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class AssortedScans extends Connector {
    constructor() {
        super();
        super.id = 'assortedscans';
        super.label = 'assortedscans';
        this.tags = ['manga', 'english'];
        this.url = 'https://assortedscans.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, '#series-title');
        let title = data['0'].text.trim();
        let id = uri.pathname + uri.search;
        return Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(new URL('/reader/', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'section.series h2.series-title a');
        return data.map(element => {
                return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
            };
        });
    }

    async _getChapters(manga) {
        let id = this.getId(manga.id);
        let request = new Request(new URL(id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapter > a');
        return data
            .map(element => {
                return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title
                }
            });
    }

    getId(url) {
        return url.match(/\/reader\/.*\/?/)[0];
    }

    async _getMaxSite(chapterId) {
        let id = this.getId(chapterId);
        let request = new Request(new URL(id + '1/', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'li.dropdown-element.page-details:last-child a');
        let maxSite = data['0'].text.match(/Page (\d+)/)[1];
        return [id, parseInt(maxSite)];
    }

    async _getPages(chapter) {

        const id = this.getId(chapter.id);
        const request = new Request(new URL(id + '1/', this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'li.dropdown-element.page-details a');
        return data.map(element => {
                const maxPage = element.text.match(/Page (\d+)/)[1];
                return this.createConnectorURI(this.url + id + maxPage)
            });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        return this.fetchDOM(request, 'source#page-image')
            .then(data => {
                let link = this.getRootRelativeOrAbsoluteLink(data[0], request.url);
                link = new URL(link, request.url).href;
                return fetch(link, this.requestOptions);
            })
            .then(response => response.blob())
            .then(data => this._blobToBuffer(data))
            .then(data => {
                this._applyRealMime(data);
                return Promise.resolve(data);
            })
    }
}