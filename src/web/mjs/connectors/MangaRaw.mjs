import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaRaw extends Connector {

    constructor() {
        super();
        super.id = 'mangaraw';
        super.label = 'MangaRaw (Manga Raw Club)';
        this.tags = ['multi-lingual', 'manga', 'webtoon'];
        this.url = 'https://www.manga-raw.club';
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url +'/browse/', this.requestOptions);
        let data = await this.fetchDOM(request, 'div.catalog ul.paginator li:nth-last-of-type(2) a');
        let pageCount = parseInt(data[0].href.match(/results=(\d+)/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            await this.wait(250);
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(`${this.url}/browse/?results=${page}`, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.catalog div.card h3.card__title a', 3);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'h1.section__title');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.tab-pane source');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.card__meta ul li a');
        return data.map(element => {
            const language = element.text.match(/-([a-z]+)-li/);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(/-([a-z]+)-li/, ' ($1)').trim(),
                language: language ? language.pop() : 'raw'
            };
        });
    }
}