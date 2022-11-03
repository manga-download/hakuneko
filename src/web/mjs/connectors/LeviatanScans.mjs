import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LeviatanScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'leviatanscans';
        super.label = 'LeviatanScans';
        this.tags = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://en.leviatanscans.com';
        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-referer', `${this.url}/`);
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        request.headers.delete('x-origin');
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}