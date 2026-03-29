import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class MangaKawaii extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'mangakawaii';
        super.label = 'MangaKawaii';
        this.tags = [ 'manga', 'french', 'english' ];
        this.url = 'https://www.mangakawaii.io';
        this.cdn = 'https://cdn.mangakawaii.pics';

        this.queryMangas = 'ul.manga-list-text li a.alpha-link';
        this.queryChapters = 'table.table--manga tbody td.table__chapter a';
        this.queryTitleForURI = 'h1[itemprop*="name"]';

        this.requestOptions.headers.set('x-referer', this.url);

    }

    async _getMangas() {
        const token = await this.getToken();
        let request = new Request(new URL(this.path + 'changeMangaList?type=text', this.url), this.requestOptions);
        request.headers.set('X-Requested-With', 'XMLHttpRequest');
        request.headers.set('X-CSRF-TOKEN', token);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            const bloat = element.querySelector('span');
            if (bloat) element.removeChild(bloat);
            return {
                id: this.getRelativeLink(element),
                title: element.text.trim()
            };
        });
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
        const script = `
        new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    resolve(pages.map(page => '${this.cdn}/uploads/manga/'+ oeuvre_slug +'/chapters_'+applocale+'/'+chapter_slug+ '/'+page.page_image));
                }
                catch(error) {
                    reject(error);
                }
            },
            500);
        });
        `;

        const data = await Engine.Request.fetchUI(request, script, 10000);
        return data.map(page => this.createConnectorURI({url : page, referer : uri}));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        let data = await response.blob();
        return this._blobToBuffer(data);
    }

    async getToken() {
        const request = new Request(this.url, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[name="csrf-token"]');
        return data[0].content;
    }

}
