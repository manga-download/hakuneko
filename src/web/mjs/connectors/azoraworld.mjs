import WordPressMadara from './templates/WordPressMadara.mjs';
export default class AzoraWorld extends WordPressMadara {

    constructor() {
        super();
        super.id = 'azoraworld';
        super.label = 'AzoraWorld (AzoraManga)';
        this.tags = [ 'webtoon', 'arabic', 'manga' ];
        this.url = 'https://azoramoon.com';
    }

    async _getPages(chapter) {
        const url = new URL(chapter.id, this.url);
        const request = new Request(url, this.requestOptions);
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    var imgdata = JSON.parse(CryptoJS.AES.decrypt(chapter_data, wpmangaprotectornonce, {
                        format: CryptoJSAesJson
                    }).toString(CryptoJS.enc.Utf8));
                    resolve(JSON.parse(imgdata));
                },3000);
            });
        `;
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(picture => this.createConnectorURI({url : picture, referer : url}));
    }

}
