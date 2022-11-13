import WordPressMadara from './templates/WordPressMadara.mjs';
export default class MadaraDex extends WordPressMadara {
    constructor() {
        super();
        super.id = 'madaradex';
        super.label = 'MadaraDex';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://madaradex.org';
    }
    async _handleConnectorURI(payload) {
        this.requestOptions.headers.set('x-referer', this.url);
        let request = new Request(payload.url, this.requestOptions);
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}