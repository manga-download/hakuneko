import FlatManga from './templates/FlatManga.mjs';

export default class TruyenTranhLH extends FlatManga {

    constructor() {
        super();
        super.id = 'truyentranhlh';
        super.label = 'TruyentranhLH';
        this.tags = [ 'manga', 'webtoon', 'vietnamese' ];
        this.url = 'https://truyentranhlh.net';

        this.queryMangaTitle = 'meta[property="og:title"]';
        this.queryChapters = 'ul.list-chapters > a';
        this.queryChapterTitle = 'div.chapter-name';
        this.queryPages = 'div#chapter-content source';
        this.language = '';
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
}