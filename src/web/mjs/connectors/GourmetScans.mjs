import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GourmetScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'gourmetscans';
        super.label = 'Gourmet Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://gourmetsupremacy.com';
    }

    async _getPages(chapter) {
        const url = new URL(chapter.id, this.url);
        const request = new Request(url, this.requestOptions);
        const script = `
            new Promise( (resolve, reject) => {
                let tries = 0;
                const interval = setInterval(function () {
                    try {
                        if (CryptoJS) {
                            clearInterval(interval);
                            let imgdata = JSON.parse(CryptoJS.AES.decrypt(chapter_data, wpmangaprotectornonce, {
                                format: CryptoJSAesJson
                            }).toString(CryptoJS.enc.Utf8));
                            resolve(JSON.parse(imgdata));
                        }
                    } catch (error) {
                        clearInterval(interval);
                        reject(error);
                    } finally {
                        tries++;
                        if (tries > 10) {
                            clearInterval(interval);
                            reject(new Error('Unable to get pictures after more than 10 tries !'));
                        }
                    }
                }, 1000);
               window.dispatchEvent(new KeyboardEvent('mousemove'));
            });
        `;
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(picture => this.createConnectorURI({url : picture, referer : url}));
    }
}
