import FlatManga from './templates/FlatManga.mjs';

export default class ManhuaScan extends FlatManga {

    constructor() {
        super();
        super.id = 'manhuascan';
        super.label = 'ManhuaScan';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'multi-lingual' ];
        this.url = 'https://manhuascan.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.queryChapters = 'div#tab-chapper div#list-chapters span.title a.chapter';
    }

    async _getPages(chapter) {
        const script = `
            new Promise(async resolve => {
                const response = await fetch('/app/manga/controllers/cont.chapterServer1.php', {
                    method: 'POST',
                    body: 'id=' + chapter_id,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                const data = await response.text();
                const key = CryptoJS.enc.Hex.parse('e11adc3949ba59abbe56e057f20f131e');
                const options = {
                    iv: CryptoJS.enc.Hex.parse('1234567890abcdef1234567890abcdef'),
                    padding: CryptoJS.pad.ZeroPadding
                };
                const decrypted = CryptoJS.AES.decrypt(data, key, options).toString(CryptoJS.enc.Utf8).replace(/(^\u0002+)|(\u0003+$)/g, '').trim();
                resolve(decrypted.split(','));
            });
        `;
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}