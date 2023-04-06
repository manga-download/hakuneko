import WordPressMadara from './templates/WordPressMadara.mjs';

export default class CeriseScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'cerisescans';
        super.label = 'Cerise Scans';
        this.tags = [ 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://cerisescan.com';
    }
    //WP MangaProtector
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
        return await Engine.Request.fetchUI(request, script);
    }
}
