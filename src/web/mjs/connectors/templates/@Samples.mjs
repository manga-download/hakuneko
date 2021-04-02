import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Samples extends Connector {

    constructor() {
        super();
        super.id = 'template';
        super.label = 'Template';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://template.net';
    }

    // May overwrite the default initiaslization in case some custom stuff needs to be done ...
    async _initializeConnector() {
        const uri = new URL(this.url);
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, '');
    }

    // May overwrite the default copy & paste matcher in case to support various URL patterns with this connector ...
    canHandleURI(uri) {
        return /https?:\/\/(?:www\.)?template.net/.test(uri.origin);
    }

    // Recommend to overwrite the manga extractor for copy & paster URLs ...
    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[property="og:title"]');
        return new Manga(this, uri.pathname, data[0].content.trim());
    }

    // Must overwrite the method to extract the manga list from the website
    async _getMangas() {
        const uri = new URL('/manga-list', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.mangas > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    // A variation that will iterate through a multi-page manga list (with abort condition)
    /*
    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    */

    // A variation that will iterate through a multi-page manga list (with page number limit)
    /*
    async _getMangas() {
        let mangaList = [];
        const uri = new URL('/manga-list', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul.pagination li:last-of-type a');
        const pageCount = parseInt(data[0].href.match(/(\d)+$/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }
    */

    // A private method that may be used for multi-page manga list scraping
    /*
    async _getMangasFromPage(page) {
        const uri = new URL('/manga-list/' + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.mangas > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }
    */

    // Must overwrite the method to extract the chapter list from the website
    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.chapters > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    // The chapter list may also be multi-paged and therefore the same variations as for the manga list scraping may be used as well

    // Must overwrite the method to extract the page list from the website (image links)
    // NOTE: All <img> tags are replaced with <source> tags when using fetchDOM, consider this in the CSS query
    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.images > source');
        return data.map(image => this.getAbsolutePath(image, request.url));
    }
}