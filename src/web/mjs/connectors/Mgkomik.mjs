import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Mgkomik extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mgkomik';
        super.label = 'MGKOMIK';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://mgkomik.id/';
        this.queryMangas = 'div.manga div > a';
    }

    async _getMangasFromPage(page) {
        let request = this._createMangaRequest(page);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.trim()
            };
        });
    }

}
