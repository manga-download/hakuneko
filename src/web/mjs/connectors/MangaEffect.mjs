import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaEffect extends WordPressMadara {
    constructor() {
        super();
        super.id = 'mangaeffect';
        super.label = 'MangaEffect';
        this.tags = [ 'manga', 'scanlation', 'english' ];
        this.url = 'https://mangaeffect.com';
    }

    _createMangaRequest(page) {
        return new Request(new URL(`/manga/page/${page}/`, this.url), this.requestOptions);
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
