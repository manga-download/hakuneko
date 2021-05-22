import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ManhwaTaro extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manhwataro';
        super.label = 'ManhwaTaro';
        this.tags = [ 'webtoon', 'hentai', 'indonesian' ];
        this.url = 'https://manhwataro.xyz';
        this.path = '/az-list/';
    }

    async _getMangas() {
        let mangaList = [];
        let categories = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        categories = [ '.', '0-9', ...categories ];
        for(let category of categories) {
            for (let page = 1, run = true; run; page++) {
                const mangas = await this._getMangasFromPage(category, page);
                mangas.length > 0 ? mangaList.push(...mangas) : run = false;
            }
        }
        return mangaList;
    }

    async _getMangasFromPage(category, page) {
        const uri = new URL(`${this.path}page/${page}/`, this.url);
        uri.searchParams.set('show', category);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.page div.listo div.bsx > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }
}