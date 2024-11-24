import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class XoxoComics extends Connector {

    constructor() {
        super();
        super.id = 'xoxocomics';
        super.label = 'XoxoComics';
        this.tags = [ 'comic', 'english' ];
        this.url = 'https://xoxocomic.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const id = uri.pathname;
        const title = (await this.fetchDOM(request, '#item-detail > h1.title-detail'))[0].textContent.trim().split(' Comic')[0];
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangaList = [];
        for (const letter of '0abcdefghijklmnopqrstuvwxyz'.split('')) {
            for(let page = 1, run = true; run; page++) {
                const mangas = await this._getMangasFromPage(page, letter);
                mangas.length > 0 ? mangaList.push(...mangas) : run = false;
            }
        }
        return mangaList;
    }

    async _getMangasFromPage(page, letter) {
        const uri = new URL(`/comic-list/?c=${letter}&page=${page}`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.chapter a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        for(let page = 1, run = true; run; page++) {
            let chapters = await this._getChaptersFromPage(manga, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        const uri = new URL(manga.id + '?page=' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.chapter > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.replace(manga.title, '').trim(),
                language: '',
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id + '/all', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.page-chapter source');
        return data.map(element => element.dataset['original'] || element.src);
    }
}
