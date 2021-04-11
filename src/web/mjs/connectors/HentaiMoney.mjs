import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class HentaiMoney extends Connector {

    constructor() {
        super();
        super.id = 'hentaimoney';
        super.label = 'hentai.money';
        this.tags = [ 'manga', 'hentai', 'english' ];
        this.url = 'https://hentai.money';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[property="og:title"]');
        return new Manga(this, uri.pathname.match(/book\/(\d+)/)[1], data[0].content.trim());
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
        const uri = new URL('/homeindex/' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        if(page > data.length) {
            return [];
        }
        return data.data.map(entry => {
            return {
                id: entry.channel,
                title: entry.Name
            };
        });
    }

    async _getChapters(manga) {
        return [ Object.assign({}, manga) ];
    }

    async _getPages(chapter) {
        const uri = new URL('/book/' + chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.images;
    }
}