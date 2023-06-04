import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhuaPlus extends WordPressMadara {

    constructor() {
        super();
        super.id = 'manhuaplus';
        super.label = 'ManhuaPlus';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://manhuaplus.com';

        this.queryPages = 'figure source, div.page-break source, div.chapter-video-frame source, div.reading-content p source';
        this.requestOptions.headers.set('x-referer', this.url);
        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Windows NT 10.0; rv:111.0) Gecko/20100101 Firefox/111.0');
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.wp-pagenavi a.last');
        let pageCount = parseInt(data[0].href.match(/\d+/)[0]);
        for(let page = 0; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/page/' + page+'/', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.item-thumb a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.trim()
            };
        });
    }
}
