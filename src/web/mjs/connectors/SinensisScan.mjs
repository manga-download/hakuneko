import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class SinensisScan extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'sinensisscan';
        super.label = 'SinenSis  Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://sinensisscans.com';
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        uri.searchParams.set('style', 'list');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.novelContentQuery);
        return data.length > 0 ? this._getPagesNovel(request) : this._getWProtectedPages(chapter);
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

}
