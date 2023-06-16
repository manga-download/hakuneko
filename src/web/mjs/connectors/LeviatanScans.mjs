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

    _createMangaRequest(page) {
        return new Request(new URL(`/ranking/page/${page}/`, this.url), this.requestOptions);
    }

    async _getPages(chapter) {
        return await this._getWProtectedPages(chapter);
    }

    async _getWProtectedPages(chapter) {
        const url = new URL(chapter.id, this.url);
        const request = new Request(url, this.requestOptions);
        const script = `
            new Promise((resolve, reject) => {
                var imgdata = JSON.parse(CryptoJS.AES.decrypt(chapter_data, wpmangaprotectornonce, {
                    format: CryptoJSAesJson
                }).toString(CryptoJS.enc.Utf8));
                resolve(JSON.parse(imgdata));
            });
        `;
        return await Engine.Request.fetchUI(request, script);
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
