import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Daysneo extends Connector {

    constructor() {
        super();
        super.id = 'daysneo';
        super.label = 'daysneo';
        this.tags = ['manga', 'japanese', 'hentai'];
        this.url = 'https://daysneo.com';
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL(`/search/?page_num=${page}`, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'strong > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'p.f150.b');
        const id = uri.pathname + uri.search;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchRegex(request, /src="([^"]*)">'\);/g);
        return data.map(image => this.getAbsolutePath(image, request.url));
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'strong > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim()
            };
        });
    }
}