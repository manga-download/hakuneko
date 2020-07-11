import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class HocVienTruyenTranh extends Connector {

    constructor() {
        super();
        super.id = 'hocvientruyentranh';
        super.label = 'Hoc Vien Truyen Tranh';
        this.tags = [ 'manga', 'vietnamese', 'webtoon' ];
        this.url = 'https://hocvientruyentranh.net';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.__info h3.__name');
        let id = uri.pathname;
        let title = data[0].textContent;
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(new URL('/truyen/all', this.url), this.requestOptions);
        let pages = await this.fetchDOM(request, 'ul.pagination li:nth-last-child(2) > a');
        pages = Number(pages[0].text);

        let mangas = [];
        for (let page = 0; page <= pages; page++) {
            request = new Request(new URL('/truyen/all' + '?' + 'page' + '=' + page, this.url), this.requestOptions);
            let data = await this.fetchDOM(request, 'tbody td:first-of-type > a');
            mangas.push( ...data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.textContent.trim()
                };
            }));
        }

        return mangas;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'tbody td:first-of-type > a');
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
        let data = await this.fetchDOM(request, 'div.manga-container source.img-responsive');
        return data.map(element => this.getAbsolutePath(element, this.url));
    }
}