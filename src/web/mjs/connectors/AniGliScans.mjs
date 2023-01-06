import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class AniGliScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'anigliscans';
        super.label = 'AniGliScans';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://anigliscans.com';
        this.path = '/series/?list';
    }
    async _getPages(chapter) {
        const data = await super._getPages(chapter);
        return data.map(element => this.createConnectorURI(element));
    }
    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        request.headers.set('x-referer', this.url);
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}
