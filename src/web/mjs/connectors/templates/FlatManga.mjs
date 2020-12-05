import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class FlatManga extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = undefined;
        this.path = '/manga-list.html?listType=allABC';

        this.queryMangaTitle = 'li:last-of-type span[itemprop="name"]';
        this.queryMangas = 'span[data-toggle="mangapop"] a';
        this.queryChapters = 'div#tab-chapper table tr td a.chapter';
        this.queryChapterTitle = undefined;
        this.queryChapterLanguage = 'ul.manga-info h1 span.flag-icon';
        this.queryChapterLanguageClassRX = /flag-icon-([a-zA-Z]+)/;
        this.queryPages = 'source.chapter-img';
        this.language = 'jp';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangaTitle);
        let id = uri.pathname;
        let title = (data[0].content || data[0].textContent).trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let uri = new URL(this.path, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map( element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let response = await fetch(request);
        if(response.status !== 200) {
            throw new Error(`Failed to receive chapter list (status: ${response.status}) - ${response.statusText}`);
        }
        let data = await response.text();
        let dom = this.createDOM(data);
        let language = dom.querySelector(this.queryChapterLanguage);
        language = language ? language.className.match(this.queryChapterLanguageRX)[1] : this.language;
        return [...dom.querySelectorAll(this.queryChapters)].map(element => {
            let title = (this.queryChapterTitle ? element.querySelector(this.queryChapterTitle) : element).textContent.replace(manga.title, '');
            let mangaTitle = manga.title.replace(/\s*-\s*RAW$/, '');
            title = title.replace(new RegExp(mangaTitle, 'i'), '');
            title = title.replace(/^\s*-\s*/, '');
            title = title.replace(/-\s*-\s*Read\s*Online\s*$/, '');
            title = title.trim();
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: title,
                language: language
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data
            .map(element => {
                try {
                    element.dataset.src = atob(element.dataset.src);
                } catch(_) { /* ignore */ }
                try {
                    element.dataset.original = atob(element.dataset.original);
                } catch(_) { /* ignore */ }
                return this.getAbsolutePath(element.dataset.src || element.dataset.original || element, request.url);
            })
            .filter(url => !url.includes('3282f6a4b7_o') && !url.includes('donate'))
            .map(url => this.createConnectorURI(url));
    }
}