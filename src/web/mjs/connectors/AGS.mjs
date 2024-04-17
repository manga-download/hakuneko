import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AGS extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'ags';
        super.label = 'AGS (Animated Glitched Scans)';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://agscomics.com';
        this.path = '/series/?list';
    }

    get icon() {
        return '/img/connectors/anigliscans';
    }

    async _getPages(chapter) {
        const data = await super._getPages(chapter);
        return data.map(element => this.createConnectorURI(element));
    }

    async _handleConnectorURI(payload) {
        const request = new Request(payload, this.requestOptions);
        request.headers.set('x-referer', this.url);
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}
