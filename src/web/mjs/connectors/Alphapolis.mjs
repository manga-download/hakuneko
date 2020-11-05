import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Alphapolis extends Connector {

    constructor() {
        super();
        super.id = 'alphapolis';
        super.label = 'ALPHAPOLIS (アルファポリス)';
        this.tags = ['manga', 'japanese', 'hentai'];
        this.url = 'https://www.alphapolis.co.jp/';
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL('/manga/official/search', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'span:last-child > a');
        let pageCount = parseInt(data[0].href.match(/(\d)+$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(`/manga/official/search?page=${page}`, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.official-manga-panel > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('.title').textContent.replace('[R18]', '').trim()
            };
        });
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.manga-detail-description > div.title');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchRegex(request, /_pages\.push\("([^)]*)"\);/g);
        return data.filter(link => link.length > 5);
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.episode-unit');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a.read-episode'), this.url),
                title: element.querySelector('div.title').textContent.trim()
            };
        });
    }
}