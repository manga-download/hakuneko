import GnuBoard5BootstrapBasic2 from './templates/GnuBoard5BootstrapBasic2.mjs';

export default class Manatoki extends GnuBoard5BootstrapBasic2 {

    constructor() {
        super();
        super.id = 'manatoki';
        super.label = 'Manatoki';
        this.tags = [ 'manga', 'webtoon', 'korean' ];
        this.url = 'https://manatoki.net';

        this.path = [ '/webtoon', '/comic' ];
        this.queryMangasPageCount = 'div.list-page ul.pagination li:last-child a';
        this.queryMangas = 'ul#webtoon-list-all li div.img-item div.in-lable a';
        this.queryManga = 'meta[name="subject"]';
        this.queryChapters = 'div.serial-list li.list-item div.wr-subject a';
        this.scriptPages = `
        new Promise(resolve => {
            const queryPages = document.querySelectorAll('div.view-padding div > img').length === 0 ? 'div.view-padding div > p:not([class]) img' : 'div.view-padding div > img';
            resolve([...document.querySelectorAll(queryPages)].map(image => JSON.stringify(image.dataset).match(/"\\S{11}":"(.*)"/)[1]));
        });
        `;

    }
    canHandleURI(uri) {
        return /https?:\/\/manatoki\d*.com/.test(uri.origin);
    }

    async _getMangas() {
        let mangaList = [];
        for(let path of this.path) {
            let uri = new URL(path, this.url);
            let request = new Request(uri, this.requestOptions);
            let data = await this.fetchDOM(request, this.queryMangasPageCount);
            let pageCount = parseInt(data[0].href.match(/\d+$/)[0]);
            for(let page = 1; page <= pageCount; page++) {
                let mangas = await this._getMangasFromPage(path + '/p' + page);
                mangaList.push(...mangas);
            }
        }
        return mangaList;
    }
}