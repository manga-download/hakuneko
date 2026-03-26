import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class MangaDoor extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'mangadoor';
        super.label = 'MangaDoor';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'http://mangadoor.com';
        this.language = 'es';
    }
    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => {
            try {
                const src = element.dataset['src'].split('://').pop();
                return this.createConnectorURI(decodeURIComponent(atob(src || undefined)));
            } catch(error) {
                let src = (element.dataset['src'] || element.src).trim();
                return this.createConnectorURI(new URL(src, request.url).href);
            }
        });
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
