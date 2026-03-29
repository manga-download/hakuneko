import YoungChampion from './YoungChampion.mjs';

//ComiciViewer
export default class ComicRide extends YoungChampion {
    constructor() {
        super();
        super.id = 'comicride';
        super.label = 'ComicRide';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://comicride.jp';
        this.apiUrl = this.url;
        this.links = {
            login: 'https://comicride.jp/signin'
        };
    }
    async _getMangas() {
        let mangaList = [];
        for (let page = 0, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
}
