import Connector from '../engine/Connector.mjs';
//import Manga from '../engine/Manga.mjs';

export default class Shogakukan extends Connector {

    constructor() {
        super();
        super.id = 'shogakukan';
        super.label = '小学館 (Shogakukan)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.shogakukan.co.jp';
    }

    async _getMangaFromURI(/*uri*/) {
        /*
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'head title');
        let id = uri.pathname;
        let title = data[0].text.split(' | ')[0].trim();
        return new Manga(this, id, title);
        */
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/comics/type/all', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.pagination01 ul li.last a');
        let pageCount = parseInt(data[0].href.match(/page=(\d+)/)[1]);
        console.log('Pages:', pageCount);
        pageCount = 5;
        for(let page = 0; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/comics/type/all?page=' + page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.card div p.p-1 a', 5);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(/*manga*/) {
        /*
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'table.table tbody tr td:first-of-type a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim(),
                language: ''
            };
        });
        */
    }

    async _getPages(/*chapter*/) {
        /*
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#reader div.chapter-content source.chapter-img');
        return data.map(element => this.getAbsolutePath(element, request.url));
        */
    }
}