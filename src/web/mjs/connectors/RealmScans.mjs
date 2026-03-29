import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class RealmScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'realmscans';
        super.label = 'Rizz Comics';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://rizzfables.com';
        this.path = '/series/';
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangas() {
        const request = new Request(new URL(this.path, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.bsx a');
        return data.map(element => {
            return {
                id: element.pathname,
                title: element.querySelector('div.tt').textContent.trim()
            };
        });
    }

    async _getPages(chapter) {
        const data = await super._getPages(chapter);
        return data.map(element => this.createConnectorURI(element));
    }
    async _handleConnectorURI(payload) {
        const request = new Request(payload, this.requestOptions);
        request.headers.set('x-referer', this.url);
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}
