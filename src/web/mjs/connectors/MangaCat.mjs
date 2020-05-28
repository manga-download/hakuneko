import GnuBoard5BootstrapBasic2 from './templates/GnuBoard5BootstrapBasic2.mjs';

export default class MangaCat extends GnuBoard5BootstrapBasic2 {

    constructor() {
        super();
        super.id = 'mangacat';
        super.label = 'MangaCat';
        this.tags = [ 'hentai', 'korean' ];
        this.url = 'https://mangacat.net';

        this.path = [ '/만화책', '/포토툰' ];
        this.queryMangas = 'div#wt_list .section-item-inner div.section-item-title > a';
    }

    async _getPathList(basePath) {
        let uri = new URL(basePath, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.list-page ul.wtpagination nav.pg_wrap a.pg_end');
        let pageCount = parseInt(data[0].href.match(/wpage=(\d+)/)[1]);
        return [...new Array(pageCount - 1).keys()].map(page => basePath + '?wpage=' + (page + 1));
    }

    async _getMangas() {
        let pages = [];
        for(let path of this.path) {
            let data = await this._getPathList(path);
            pages.push(...data);
        }
        this.path = pages;
        return super._getMangas();
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#bo_list table.bt-table tbody tr td[title] a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }
}