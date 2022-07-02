import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class MangaKawaii extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'mangakawaii';
        super.label = 'MangaKawaii';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://www.mangakawaii.io';
        this.cdn = 'https://cdn.mangakawaii.pics';

        this.queryMangas = 'ul.manga-list-text li a.alpha-link';
        this.queryChapters = 'table.table--manga tbody td.table__chapter a';
        this.queryPages = 'div.text-center source[loading="lazy"]';
        this.queryTitleForURI = 'h1[itemprop*="name"]';

        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangas() {
        const mangas = await super._getMangas();
        mangas.forEach(manga => manga.title = manga.title.replace(/^\//, '').trim());
        return mangas;
    }

    async _getChapters(manga) {
        const englishChapters = await this._getChaptersFromLanguage(manga, 'en');
        const frenchChapters = await this._getChaptersFromLanguage(manga, 'fr');
        return [...englishChapters, ...frenchChapters];
    }

    async _getChaptersFromLanguage(manga, language) {
        await this.changeLanguage(language);
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const firstChapter = await this.fetchDOM(request, this.queryChapters);
        if(typeof firstChapter[0] === 'undefined') {
            return [];
        }
        const uri2 = new URL(this.getRootRelativeOrAbsoluteLink(firstChapter[0], this.url), this.url);
        const request2 = new Request(uri2, this.requestOptions);
        const data = await this.fetchDOM(request2, '#dropdownMenuOffset+ul li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: `${element.textContent.trim()} [${language}]`,
                language
            };
        });
    }

    async changeLanguage(language) {
        const uri = new URL('/lang/' + language, this.url);
        const request = new Request(uri, this.requestOptions);
        await Engine.Request.fetchUI(request, '');
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const dom = await this.fetchDOM(request, 'script[type="text/javascript"]');
        const manga_slug = dom[0].textContent.match(/var oeuvre_slug = "([^"]*)";/)[1];
        const chapter_slug = dom[0].textContent.match(/var chapter_slug = "([^"]*)";/)[1];
        const language = dom[0].textContent.match(/var applocale = "([^"]*)";/)[1];
        return [...dom[0].textContent.matchAll(/"page_image":"([^"]*)"/g)].map(file => this.createConnectorURI({
            url: `${this.cdn}/uploads/manga/${manga_slug}/chapters_${language}/${chapter_slug}/${file[1]}`,
            referer: this.url
        }));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        let data = await response.blob();
        return this._blobToBuffer(data);
    }
}