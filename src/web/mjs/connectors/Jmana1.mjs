import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Jmana1 extends Connector {
    constructor() {
        super();
        super.id = 'jmana1';
        super.label = '제이마나 {Jaymana)';
        this.tags = [ 'manga', 'korean' ];
        this.url = 'https://jmana1.net';

        this.path = '/comic_main';
        this.queryMangas = 'div.section div div.conts ul.allList li a';
        this.queryChapters = 'div.post-content-list h2 a';
        this.queryPages = 'div ul.listType.view li#view_content2 source';
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
        // NOTE: Avoid 429 Too Many Request
        await new Promise(r => setTimeout(r, 2000));
        const uri = new URL(this.path, this.url);
        uri.searchParams.set('page', page);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('span.titBox span.price').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryChapters);
        return data.map(el => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(el, this.url),
                title: el.textContent.replace(manga.title, '').trim(),
            };
        });
    }

    // TODO: address 403 Forbidden
    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => {
            return this.getAbsolutePath(element.dataset['src'] || element['srcset'] || element, request.url);
        });
    }

    async _getMangaFromURI(uri) {
        const urlParams = new URLSearchParams(uri.search);
        const bookname = urlParams.get('bookname');
        const id = `/book?bookname=${bookname}`;
        const title = bookname.replace('+', ' ');
        return new Manga(this, id, title);
    }
}