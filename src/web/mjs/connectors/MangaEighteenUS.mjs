import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaEighteenUS extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manga18-us';
        super.label = 'Manhuascan.us (Manga18.us)';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://manhuascan.us';
        this.path = '/manga-list?page=';

        this.queryMangas = 'div.listupd div.bsx > a';
    }

    async _getMangas() {
        const mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
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
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.trim()
            };
        });
    }
}