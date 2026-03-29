import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class TvYManga extends Connector {

    constructor() {
        super();
        super.id = 'tvymanga';
        super.label = 'Tv y Manga';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://tvymanga.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'main#main header.entry-header h1.entry-title');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(this.url + '/lista-de-mangas/', this.requestOptions);
        let data = await this.fetchDOM(request, 'main#main div.entry-content ul li h4 a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'main#main div.entry-content ul.lcp_catlist li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'main#main div.entry-content > div[style*="overflow"] > source');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}