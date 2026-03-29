import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TmoManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'tmomanga';
        super.label = 'TMOManga';
        this.tags = [ 'manga', 'webtoon', 'spanish' ];
        this.url = 'https://tmomanga.com';
        this.path ='/biblioteca';
        this.queryMangas = 'div.manga_biblioteca a[title]';
        this.queryMangasPageCount = 'ul.pagination li:nth-last-of-type(2) a';
        this.queryPages = 'div.reading-content div#images_chapter source.img-fluid.lazyload';
    }
    async _getMangas() {
        let mangaList = [];
        const uri = new URL(this.path, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangasPageCount);
        const pageCount = parseInt(data[0].text);
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        const uri = new URL(this.path+ '?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }
}