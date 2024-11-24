import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class RawSenManga extends Connector {

    constructor() {
        super();
        super.id = 'rawsenmanga';
        super.label = 'RawSenManga';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://raw.senmanga.com';
        this.links = {
            login: 'https://raw.senmanga.com/login'
        };
        this.requestOptions.headers.set('x-cookie', 'viewer=1');
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname;
        const title = (await this.fetchDOM(request, 'div.desc h1.series'))[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + '/directory', this.requestOptions);
        let data = await this.fetchDOM(request, 'div.content ul.pagination li:nth-last-of-type(2) a.page-link');
        let pageCount = parseInt(data[0].textContent.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(this.url + '/directory?page=' + page, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.content div.mng');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a'), this.url),
                title: element.querySelector('div.series-title').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.content ul.chapter-list li > a.series');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(this.url + chapter.id, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.reader source.picture');
        return data.filter(picture => !picture.src.includes('histats') ).map(picture => this.getRootRelativeOrAbsoluteLink(picture, this.url));
    }
}