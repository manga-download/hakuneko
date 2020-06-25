import Connector from '../engine/Connector.mjs';

export default class DemoneCeleste extends Connector {

    constructor() {
        super();
        super.id = 'demoneceleste';
        super.label = 'Demone Celeste';
        this.tags = [ 'manga', 'italian' ];
        this.url = 'https://www.demoneceleste.it';
    }

    async _getMangas() {
        const request = new Request(new URL('/manga', this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div#myTabContent h4 > a');

        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.pathname, this.url),
                title: element.innerText.trim()
            };
        });
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.col-md-8.text-center > div a');

        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.pathname, this.url),
                title: element.innerText.trim().replace(/\s+/, ' ')
            };
        });
    }

    async _getPages(chapter) {
        const target = chapter.id.match(/.*\/(.*)\/(\d+).*$/);
        let data = await this._fetchPOST(chapter.id, 'ajax=pagine&id='+target[1]+'&n='+target[2]+'&leggo=1');

        const parser = new DOMParser();
        data = parser.parseFromString(data, "text/xml");

        return [...data.getElementsByTagName('pag')].map(element => new URL(element.textContent, this.url).href);
    }

    async _fetchPOST(uri, body) {
        const request = new Request(new URL('/ajax.php', this.url), {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-referer': this.getAbsolutePath(uri, this.url)
            }
        });
        const data = await fetch(request);
        return data.text();
    }
}