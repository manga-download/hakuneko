import Connector from '../engine/Connector.mjs';

export default class TruyenTranhLH extends Connector {

    constructor() {
        super();
        super.id = 'truyentranhlh';
        super.label = 'TruyenTranhLH';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.url = 'https://truyentranhlh.net';
    }

    async _getMangas() {
        let mangaList = [];
        let uri = new URL('/danh-sach', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.pagination_wrap a:last-of-type');
        let pageCount = parseInt(data[0].href.match(/(\d+)$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL('/danh-sach?page=' + page, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.card-body div.thumb-item-flow div.series-title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.list-chapters > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#chapter-content source');
        return data.map(element => this.getAbsolutePath(element.dataset.src || element, request.url));
    }
}