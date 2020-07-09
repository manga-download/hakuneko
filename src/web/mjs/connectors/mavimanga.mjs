import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MaviManga extends Connector {

    constructor() {
        super();
        super.id = 'mavimanga';
        super.label = 'Mavi Manga';
        this.tags = [ 'manga', 'turkish' ];
        this.url = 'https://mavimanga.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'span.mangasc-title');
        let id = uri.pathname;
        let title = data[0].textContent;
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(new URL('/manga-listesi/', this.url), this.requestOptions);
        let pages = await this.fetchDOM(request, 'div.navigation li:nth-last-child(1) > a');
        pages = Number(pages[0].pathname.match(/\/(\d+)\/$/)[1]);

        let mangas = [];
        for (let page = 0; page <= pages; page++) {
            request = new Request(new URL('/manga-listesi/sayfa/' + page, this.url), this.requestOptions);
            let data = await this.fetchDOM(request, 'ul.manga-list li a');
            mangas.push( ...data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.text.trim()
                };
            }));
        }

        return mangas;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.mangaep-list tbody tr td:first-of-type a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.viewer-cnt div#all source.img-responsive');
        return data.map(element => this.getAbsolutePath(element.dataset.src, this.url));
    }
}