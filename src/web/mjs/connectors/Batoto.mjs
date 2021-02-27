import AnyACG from './templates/AnyACG.mjs';

export default class Batoto extends AnyACG {

    constructor() {
        super();
        super.id = 'batoto';
        super.label = 'Batoto (by AnyACG)';
        this.tags = [ 'manga', 'multi-lingual' ];
        this.url = 'https://bato.to';

        this.path = '/browse?sort=title&page=';
        this.queryMangaTitle = 'h3.item-title';
        this.queryMangaTitleText = 'a';
        this.queryMangaTitleFlag = 'span.item-flag';
        this.queryMangaPages = 'nav.d-none ul.pagination li.page-item:nth-last-child(2) a.page-link';
        this.queryMangas = 'div#series-list div.item-text';
        this.queryMangaLink = 'a.item-title';
        this.queryMangaFlag = 'span.item-flag';
        this.queryChapters = 'div.episode-list div.main a.visited';
    }

    async _getPages(chapter) {
        let script = `
        new Promise(resolve => {
            const base = JSON.parse(CryptoJS.AES.decrypt(server, batojs).toString(CryptoJS.enc.Utf8));
            resolve(images.map(data => new URL(base + data, window.location.origin).href));
        });
        `;
        let request = new Request(this.url + chapter.id, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}