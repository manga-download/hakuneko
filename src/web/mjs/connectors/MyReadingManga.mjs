import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MyReadingManga extends Connector {

    constructor() {
        super();
        super.id = 'myreadingmanga';
        super.label = 'MyReadingManga';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://myreadingmanga.info';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'header.entry-header h1.entry-title');
        let id = uri.pathname.replace(/\d+\/$/, '');
        let title = data[0].textContent.replace(/^\s*\[.*?\]\s*/g, '').trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.pagination ul li:nth-last-child(2) a');
        let pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(`/page/${page}/`, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'header.entry-header h2.entry-title a.entry-title-link');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(/^\s*\[.*?\]\s*/g, '').trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.chapter-class p a, div.pagination .post-page-numbers');
        let chapterList = data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.href || request.url, this.url),
                title: element.textContent.trim(),
                language: ''
            };
        });
        // default chapter is always present
        chapterList.push({
            id: manga.id,
            title: manga.title,
            language: ''
        });
        // exclude duplicates and cross references to other mangas
        return chapterList.filter(chapter => {
            let isSameManga = chapter.id.startsWith(manga.id);
            let isUniqueChapter = chapter === chapterList.find(c => c.id === chapter.id);
            return isSameManga && isUniqueChapter;
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.entry-content source');
        return data.map(element => {
            let payload = {
                url: this.getAbsolutePath(element.dataset['lazySrc'] || element.dataset['src'] || element, request.url),
                referer: request.url
            };
            return this.createConnectorURI(payload);
        });
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        let data = await response.blob();
        return this._blobToBuffer(data);
    }
}