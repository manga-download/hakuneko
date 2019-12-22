import Connector from '../engine/Connector.mjs';

export default class RawSenManga extends Connector {

    constructor() {
        super();
        super.id = 'rawsenmanga';
        super.label = 'RawSenManga';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://raw.senmanga.com';
        this.requestOptions.headers.set('x-cookie', 'viewer=1');
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + '/directory', this.requestOptions);
        let data = await this.fetchDOM(request, 'div#content ul.pagination li:nth-last-of-type(2) a.page-link');
        let pageCount = parseInt(data[0].textContent);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + '/directory?page=' + page, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#content ul.directory li.series div.details p.title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.list div.element div.title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let script = `
            new Promise(resolve => {
                resolve(imglist.map(img => img.url));
            });
        `;
        let request = new Request(this.url + chapter.id, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}