import WordPressMadara from './templates/WordPressMadara.mjs';

export default class KuroiManga extends WordPressMadara {

    constructor() {
        super();
        super.id = 'kuroimanga';
        super.label = 'Kuroi Manga';
        this.tags = [ 'manga', 'turkish', 'webtoon'];
        this.url = 'https://www.kuroimanga.com';
        this.path = '/manga';
        this.queryMangas = 'div.item-summary div.post-title h3 a';
    }
    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        let request = new Request(new URL(this.path+'/page/'+page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }
}