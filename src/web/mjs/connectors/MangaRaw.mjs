import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaRaw extends Connector {

    constructor() {
        super();
        super.id = 'mangaraw';
        super.label = 'MangaGeko';
        this.tags = ['multi-lingual', 'manga', 'webtoon'];
        this.url = 'https://www.mgeko.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.main-head h1[itemprop="name"]');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + '/browse-comics/', this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.pagination li:nth-child(2) a');
        let pageCount = parseInt(data[0].textContent);
        for (let page = 1; page <= pageCount; page++) {
            await this.wait(250);
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(`${this.url}/browse-comics/?results=${page}`, this.requestOptions);
        let data = await this.fetchDOM(request, 'li.novel-item a', 3);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id + '/all-chapters/', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.chapter-list li a');
        return data.map(element => {
            const title = element.querySelector('strong.chapter-title').textContent;
            const language = title.match(/-([a-z]+)-li/);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: title.replace(/-([a-z]+)-li/, ' ($1)').trim(),
                language: language ? language.pop() : 'raw'
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'section.page-in div source[onerror]');
        return data.map(element => this.getAbsolutePath(element.src, request.url));
    }
}
