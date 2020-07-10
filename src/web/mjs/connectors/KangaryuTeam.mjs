import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class KangaryuTeam extends Connector {

    constructor() {
        super();
        super.id = 'kangaryuteam';
        super.label = 'Kangaryu Team';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://kangaryu-team.fr';
    }

    async _getMangas() {
        let request = new Request(new URL('/directory', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'article#content div.group.center');

        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.firstChild.href, this.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let url = new URL(manga.id, this.url);
        let data = await this._fetchPOST(url, 'adult=true', 'article#content div.list div.element div.title > a');

        return [...data].map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.href, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await fetch(request);
        data = await data.text();
        data = data.match(/^\s*(?:var|let|const)\s+pages(.*)$/m)[0];
        data = data.matchAll(/"url":"(.*?)",/g);

        return [...data].map(element => {
            return element[1].replace('\\/', '/');
        });
    }

    async _getMangaFromURI(uri) {
    }

    async _fetchPOST(uri, body, selector) {
        const request = new Request(new URL(uri, this.url), {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        let data = await fetch(request);
        data = this.createDOM(await data.text())
        return data.querySelectorAll(selector);
    }
}