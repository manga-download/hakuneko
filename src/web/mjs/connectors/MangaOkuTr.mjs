import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaOkuTr extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangaokutr';
        super.label = 'Manga Oku TR';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://mangaokutr.com';
        this.path = '/manga/list-mode/';
    }

    async _getPages(chapter) {
        let pages = await super._getPages(chapter);
        return pages.map(page => this.createConnectorURI(page));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        request.headers.set('x-referer', this.url);
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }

}
