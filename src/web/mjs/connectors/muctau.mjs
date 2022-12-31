import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Muctau extends WordPressMadara {

    constructor() {
        super();
        super.id = 'muctau';
        super.label = 'Muctau';
        this.tags = ['webtoon', 'english', ];
        this.url = 'https://bibimanga.com';
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/manga', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'a.last');
        let pageCount = parseInt(data[0].href.match(/page\/(\d+)/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL('/manga/page/' + page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.page-item-detail.manga div.item-thumb a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

}
