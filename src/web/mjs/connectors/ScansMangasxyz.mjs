import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ScansMangasxyz extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'scansmangasxyz';
        super.label = 'ScansMangas (WS)';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://scansmangas.ws';
        this.path = '/tous-nos-mangas/';
        this.queryMangas = 'div.bigor > a';
        this.queryChapters = 'span.lchx.desktop > a';
        this.queryChaptersTitle = undefined;
    }

    async _getPages(chapter) {
        const script = `
        new Promise((resolve ) => {
            resolve(pages);
        });
        `;
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(element => this.createConnectorURI(element.page_image ));
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
