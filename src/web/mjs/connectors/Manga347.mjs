import WordPressMangastream from './templates/WordPressMangastream.mjs';
export default class Manga347 extends WordPressMangastream {
    constructor() {
        super();
        super.id = 'manga347';
        super.label = 'Manga 347';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://manga347.com';
        this.path = '/filter';
        this.queryMangas = 'div.manga-detail h3.manga-name a';
        this.queryMangaPagesCount = 'ul.pagination li:nth-last-of-type(2) a';
        this.queryChapters = 'div.chapters-list-ul li.item.reading-item.chapter-item  > a';
        this.queryPages = 'div#chapter-container img[data-src]';
        this.queryChaptersTitle = 'span.name';
        this.querMangaTitleFromURI = 'div.anisc-detail h1.manga-name';
    }
    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/filter', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaPagesCount);
        const pageCount = parseInt(data[0].text);
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        const uri = new URL('/filter/' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }
}
