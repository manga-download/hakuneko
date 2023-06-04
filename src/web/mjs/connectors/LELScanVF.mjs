import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class LELScanVF extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'lelscanvf';
        super.label = 'LELSCAN-VF';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://www.lelscanvf.cc';
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
