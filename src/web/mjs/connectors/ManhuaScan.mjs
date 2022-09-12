import FlatManga from './templates/FlatManga.mjs';

export default class ManhuaScan extends FlatManga {

    constructor() {
        super();
        super.id = 'manhuascan';
        super.label = 'ManhuaScan';
        this.tags = ['manga', 'webtoon', 'hentai', 'multi-lingual'];
        this.url = 'https://manhuascan.io';
        this.requestOptions.headers.set('x-referer', this.url + '/');

        this.queryChapters = 'div#tab-chapper div#list-chapters span.title a.chapter';
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/manga-list.html', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.pagination-wrap ul.pagination li:nth-last-of-type(2) a');
        const pageCount = parseInt(data[0].text);
        for (let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/manga-list.html?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.media h3.media-heading a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    // Same decryption as in HeroScan
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
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI(request, script);
        return data.map(link => this.createConnectorURI(link));
    }
}