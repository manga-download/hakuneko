import MojoPortalComic from './templates/MojoPortalComic.mjs';
import Manga from '../engine/Manga.mjs';

export default class Manga3x extends MojoPortalComic {

    constructor() {
        super();
        super.id = 'manga3x';
        super.label = 'Manga3x';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://manga3x.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'article#item-detail h1.title-detail');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
}