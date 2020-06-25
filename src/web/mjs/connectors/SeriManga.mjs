import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class SeriManga extends Connector {

    constructor() {
        super();
        super.id = 'serimanga';
        super.label = 'Seri Manga';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://serimanga.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.seri-img div.name');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let uri = new URL('/mangalar', this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.pagination li.page-item:nth-last-of-type(2) a.page-link');
        let pageCount = parseInt(data[0].href.match(/page=(\d+)/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL('/mangalar?page=' + page, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.sub-manga-list li.mangas-item > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('span.mlb-name').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.pagination li.page-item:nth-last-of-type(2) a.page-link');
        let pageCount = data.length ? parseInt(data[0].href.match(/page=(\d+)/)[1]) : 1;
        for(let page = 1; page <= pageCount; page++) {
            let chapters = await this._getChaptersFromPage(manga, page);
            chapterList.push(...chapters);
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        let uri = new URL(manga.id, this.url);
        uri.searchParams.set('page', page);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.seri-page-list ul.spl-list li.spl-list-item > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('span').textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.reader-manga.chapter-pages source.chapter-pages__item');
        return data.map(element => this.getAbsolutePath(element.dataset.src || element, request.url));
    }
}