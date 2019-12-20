import Connector from '../engine/Connector.mjs';

export default class MangaNel extends Connector {

    constructor() {
        super();
        super.id = 'manganel';
        super.label = 'MangaNelo';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manganelo.com';

        this.path = '/genre-all/';
        this.queryMangasPageCount = 'div.panel-page-number div.group-page a.page-last:last-of-type';
        this.queryMangas = 'div.genres-item-info h3 a.genres-item-name';
        this.queryChapters = 'ul.row-content-chapter li a.chapter-name';
        this.queryPages = 'div.container-chapter-reader source';
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + this.path + '1', this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangasPageCount);
        let pageCount = parseInt(data[0].href.match(/\d+$/));
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + this.path + page, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        }).filter(manga => manga.id.startsWith('/'));
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').trim(),
                language: ''
            };
        }).filter(chapter => chapter.id.startsWith('/'));
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => this.getAbsolutePath(element.dataset['src'] || element, request.url));
    }
}