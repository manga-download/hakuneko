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
            new Promise((resolve, reject) => {
                try {
                    let rocketscript = new RocketLazyLoadScripts;
                    rocketscript._loadEverythingNow();
                } catch (error) {}
           
                setTimeout(() => {
                    var imgdata = JSON.parse(CryptoJS.AES.decrypt(chapter_data, wpmangaprotectornonce, {
                        format: CryptoJSAesJson
                    }).toString(CryptoJS.enc.Utf8));
                    resolve(JSON.parse(imgdata));
                }, 2500);
            });
        `;
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(picture => this.createConnectorURI({url : picture, referer : url}));
    }
}
