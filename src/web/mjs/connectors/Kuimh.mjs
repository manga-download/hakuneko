import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Kuimh extends Connector {
    constructor() {
        super();
        super.id = 'kuimh';
        super.label = '酷爱漫画 (Kuimh)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.kuimh.com';

        this.path = '/booklist?page=';
        this.pathMatch = 'page=(\\d+)';
        this.queryMangasPageCount = 'div.page-pagination div.pagination li:nth-last-child(2) a';
        this.queryMangas = 'ul.mh-list li div.mh-item-detali h2.title a';
        this.queryMangasURL = 'section.banner_detail div.info h1';
        this.queryChapter = 'div#chapterlistload ul#detail-list-select li a';
        this.queryPages = 'div.comiclist div.comicpage source';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangasURL);
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL(this.path, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangasPageCount);
        let pageCount = parseInt(data[0].href.match(this.pathMatch)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(this.path + page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapter);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.childNodes[0].nodeValue.trim()
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => this.getAbsolutePath(element.dataset.echo || element, request.url));
    }
}