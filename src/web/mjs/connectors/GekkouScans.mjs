import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class GekkouScans extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'gekkouscans';
        super.label = 'Gekkou Scans';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://www.gekkouscans.com.br';

        this.queryChapters = 'ul.grow li h5.chapter-title-rtl';
        this.language = 'portuguese';
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => {
            return this.createConnectorURI({
                url: this.getAbsolutePath(element.dataset['src'] || element, request.url),
                referer: request.url
            });
        });
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