import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ManhuaES extends Connector {

    constructor() {
        super();
        super.id = 'manhuaes';
        super.label = 'Manhua ES';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://manhuaes.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'h1.title-detail');
        let id = uri.pathname;
        let title = data[0].textContent;
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(new URL('/category-comics/manga/', this.url), this.requestOptions);
        let pages = await this.fetchDOM(request, 'ul.pagination li:nth-last-child(2) > a');
        pages = Number(pages[0].text);

        let mangas = [];
        for (let page = 0; page <= pages; page++) {
            request = new Request(new URL('/category-comics/manga/page/' + page, this.url), this.requestOptions);
            let data = await this.fetchDOM(request, 'div.overlay a.head');
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
        let data = await this.fetchDOM(request, 'div.list-chapter li.row a');
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
        let data = await this.fetchDOM(request, 'div.reading-detail source.alignnone');
        return data.map(element => this.getAbsolutePath(element.dataset.src, this.url));
    }
}