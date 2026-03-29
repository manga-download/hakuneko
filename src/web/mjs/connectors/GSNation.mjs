import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class GSNation extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'gsnation';
        super.label = 'Gs-Nation';
        this.tags = [ 'webtoon', 'french' ];
        this.url = 'https://gs-nation.fr';
        this.path = '/manga/list-mode/';
    }

    async _getPages(chapter) {
        const images = await super._getPages(chapter);
        return images.map(link => this.createConnectorURI({
            url: link,
            referer: this.url
        }));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        let data = await response.blob();
        return this._blobToBuffer(data);
    }
}