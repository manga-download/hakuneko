import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Manhwax extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manhwax';
        super.label = 'Manhwax';
        this.tags = [ 'manga', 'english', 'webtoon', 'hentai'];
        this.path = '/az-list/page/';
        this.url = 'https://manhwax.com';
        this.queryMangas = 'div.listo div.bs div.bsx a';
    }
    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        const uri = new URL(this.path + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('div.bigor div.tt').textContent.trim()
            };
        });
    }
}