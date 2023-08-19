import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GourmetScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'gourmetscans';
        super.label = 'Gourmet Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://gourmetscans.net';
    }

    async _getPages(chapter) {
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
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(picture => this.createConnectorURI({url : picture, referer : url}));
    }
}