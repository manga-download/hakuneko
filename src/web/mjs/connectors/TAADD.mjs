import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class TAADD extends Connector {

    constructor() {
        super();
        super.id = 'taadd';
        super.label = 'TAADD';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.taadd.com';

        this.bypassAdultWarning = true;
        this.queryMangaTitle = 'meta[property="og:title"]';
        this.queryMangas = 'div.clistChr ul li div.intro h2 a';
        this.queryChapters = 'div.chapter_list table tr td:first-of-type a';
        this.queryPages = 'select#page';
        this.queryImages = 'source#comicpic';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangaTitle);
        let id = uri.pathname;
        let title = (data[0].content || data[0].textContent).replace(/(^\s*[Мм]анга|[Mm]anga\s*$)/, '').trim();
        return new Manga(this, id, title);
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
        let uri = new URL('/search/', this.url);
        uri.searchParams.set('completed_series', 'either');
        uri.searchParams.set('page', page);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim() || element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        if(this.bypassAdultWarning) {
            uri.searchParams.set('warning', '1');
            // fix query parameter typo for ninemanga
            uri.searchParams.set('waring', '1');
        }
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            this.cfMailDecrypt(element);
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(manga.title, '').replace(/\s*new$/, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return [...data[0].querySelectorAll('option')].map(option => this.createConnectorURI(this.getAbsolutePath(option.value, request.url)));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(new URL(payload, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryImages);
        return super._handleConnectorURI(this.getAbsolutePath(data[0].src, request.url));
    }
}