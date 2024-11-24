import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class FRScan extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'frscan';
        super.label = 'Frscan';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://www.frscans.com';

        this.language = 'fr';
    }

    async _getPages(chapter) {
        return (await super._getPages(chapter)).map(element => this.createConnectorURI({url: element, referer : this.url}));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}
