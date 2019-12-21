import Connector from '../engine/Connector.mjs';

export default class VerComicsPorno extends Connector {

    constructor() {
        super();
        super.id = 'vercomicsporno';
        super.label = 'VerComicsPorno';
        this.tags = ['porn' ,'spanish'];
        this.url = 'https://vercomicsporno.com';

        this.path = '/page/';
        this.queryMangas = '#posts .gallery > a';
        this.pager = 'ul.pagination li:last-of-type a';
        this.listPages = '#posts source.lazy:not(:last-child)';
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + this.path + page, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.href.split('/')[3].replace(/(-)/g,' ')
            };
        });
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + this.path + '1' , this.requestOptions);
        let data = await this.fetchDOM(request, this.pager);
        let pageCount = parseInt(data[0].href.match(/\d+$/));
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getChapters(manga) {
        return [{
            id: manga.id,
            title: manga.title,
            language: ''
        }];
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, this.listPages);
        return data.map(element => this.getAbsolutePath(element.dataset['lazySrc'] || element, request.url));
    }
}