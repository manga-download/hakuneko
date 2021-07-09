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
        let request = new Request(new URL(/\/reader\//, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'section.series h2.series-title a');
        return data.map(element => {
                return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
            };
        });
    }

    async _getChapters(manga) {
        let id = manga.id.match(/\/reader\/.*\/?/)[0];
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

    async _getMaxSite(chapterId) {
        let id = chapterId.match(/\/reader\/.*\/?/)[0];
        let request = new Request(new URL(id + '1/', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'li.dropdown-element.page-details:last-child a');
        let maxSite = data['0'].text.match(/Page (\d+)/)[1];
        return [id, parseInt(maxSite)];
    }

    async _getPages(chapter) {
        let [id, maxSiteInt] = await this._getMaxSite(chapter.id);
        return Promise.all(new Array(maxSiteInt)
            .fill()
            .map(async (_, index) => {
                let pageRequest = new Request(new URL(id + (index + 1), this.url), this.requestOptions);
                let pageData = await this.fetchDOM(pageRequest, 'source#page-image');
                return pageData['0'].src;
            }));
    }
}