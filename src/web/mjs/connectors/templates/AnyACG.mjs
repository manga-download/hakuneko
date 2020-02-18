import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class AnyACG extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;

        this.path = '/?page=';
        this.queryMangaTitle = 'div#content div.rm h1[itemprop="name"]';
        this.queryMangaPages = 'div.pagination ul.pagination li:nth-last-child(2) a';
        this.queryMangas = 'div.mng div.title h3';
        this.queryMangaLink = 'a.series';
        this.queryMangaFlag = undefined;
        this.queryChapters = 'div.cl ul li span.leftoff a';
        this.queryPages = 'div#readerarea p#arraydata';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangaTitle);
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL(this.path, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangaPages);
        let pageCount = parseInt(data[0].text.trim());
        pageCount = 5;
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(this.path + page, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map( element => {
            let language = element.querySelector(this.queryMangaFlag);
            language = language ? ' (' + language.className.match(/flag_([_a-z]*)/)[1].replace(/_/g, '-') + ')' : '';
            let a = element.querySelector(this.queryMangaLink);
            this.cfMailDecrypt(a);
            return {
                id: this.getRootRelativeOrAbsoluteLink(a, request.url),
                title: a.text.trim() + language
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').replace(/-?\s+Read\s+Online/i, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data[0].textContent.split(',').map(image => this.getAbsolutePath(image.trim(), request.url));
    }
}