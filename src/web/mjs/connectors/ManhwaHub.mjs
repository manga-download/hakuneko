import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ManhwaHub extends WordPressMadara {
    constructor() {
        super();
        super.id = 'manhwahub';
        super.label = 'ManhwaHub';
        this.tags = [ 'webtoon', 'english', 'manga' ];
        this.url = 'https://manhwahub.net';
        this.queryTitleForURI = 'div.post-title h1';
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL(this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.pager li:nth-last-of-type(2) a');
        const pageCount = parseInt(data[0].href.match(/([\d]+)$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('?page=' + page, this.url);
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