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
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        if(uri.origin !== this.url) {
            alert('This manga is hot-linked to a different provider!\nPlease check the following website/connector:\n\n' + uri.origin);
            return [];
        }
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        if(uri.origin !== this.url) {
            alert('This chapter is hot-linked to a different provider!\nPlease check the following website/connector:\n\n' + uri.origin);
            return [];
        }
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => this.getAbsolutePath(element.dataset['src'] || element, request.url));
    }
}