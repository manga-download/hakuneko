import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Mangafast extends Connector {

    constructor() {
        super();
        super.id = 'mangafast';
        super.label = 'Mangafast';
        this.tags = [ 'manga', 'webtoon', 'english'];
        this.url = 'https://mangafast.net';
        this.path = '/read/';

        this.queryMangas = 'div.p.mrg div.ls5 a';
        this.queryChapters = 'table tbody tr td.jds a';
        this.queryPages = 'body div div#Read source';
        this.queryMangaTitle = 'div.sc table tbody tr td a';
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path + 'page/' + page + '/', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.replace(manga.title, '').trim()
            };
        });
    }

    async _getPages(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => this.getAbsolutePath(element.dataset['src'] || element.dataset['data-src'] || element.src, request.url)).filter(link => !link.includes('adskeeper.co.uk'));
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitle);
        const id = uri.pathname;
        const title = data[0].text.trim();
        return new Manga(this, id, title);
    }
}