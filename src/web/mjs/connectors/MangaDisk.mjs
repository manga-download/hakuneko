import WordPressMangastream from './templates/WordPressMangastream.mjs';
export default class MangaDisk extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangadisk';
        super.label = 'Manga Disk';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangadisk.web.id';
        this.path = '/manga/list-mode/';
        this.queryPages = 'div#readerarea canvas';
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);

        return data.map(hash => {
            const payload = {
                url: 'https://img.nesia.my.id/image?id='+hash.attributes["file-id"].value,
                referer: this.url
            };
            return this.createConnectorURI(payload);
        });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(new URL(payload.url), this.requestOptions);
        request.headers.set('x-referer', payload.referer, this.url);
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}
