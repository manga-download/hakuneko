import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReaperScansID extends WordPressMadara {
    constructor() {
        super();
        super.id = 'reaperscansid';
        super.label = 'Shinigami ID';
        this.tags = ['webtoon', 'indonesian', 'scanlation'];
        this.url = 'https://shinigami.cx';
        this.queryChapters = 'div.chapter-link > a';
        this.queryChaptersTitleBloat ='span.chapter-release-date';
        this.links = {
            login: 'https://shinigami.cx/login'
        };
    }

    async _getPages(chapter) {
        const url = new URL(chapter.id, this.url);
        const request = new Request(url, this.requestOptions);
        const script = `
            new Promise((resolve, reject) => {
                const key = post_id + 'hJ1nA7qt0fMxGPfW3WlD5QuRy1HBTOnukhP9JE' + post_id + 'aBTSjD3cSKEJEKMI34mSxRUm98Xu4hXp71YTWJ5lUnP' + post_id;
                const imgdata = JSON.parse(CryptoJS.AES.decrypt(chapter_data, key, {
                    format: CryptoJSAesJson
                }).toString(CryptoJS.enc.Utf8));
                resolve((imgdata));
            });
        `;
        return await Engine.Request.fetchUI(request, script);
    }
}
