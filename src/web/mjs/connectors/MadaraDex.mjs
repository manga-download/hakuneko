import WordPressMadara from './templates/WordPressMadara.mjs';
export default class MadaraDex extends WordPressMadara {
    constructor() {
        super();
        super.id = 'madaradex';
        super.label = 'MadaraDex';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://madaradex.org';
        this.requestOptions.headers.set('x-referer', this.url);
    }
    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-sec-fetch-dest', 'image');
        request.headers.set('accept', 'image/avif,image/webp,*/*');
        request.headers.set('x-sec-fetch-mode', 'no-cors');
        request.headers.set('Upgrade-Insecure-Requests', 1);
        request.headers.set('x-user-agent', 'Mozilla/5.0 (iPod; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.163 Mobile/15E148 Safari/604.1');
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}