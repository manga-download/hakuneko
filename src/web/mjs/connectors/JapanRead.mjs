import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class JapanRead extends Connector {

    constructor() {
        super();
        super.id = 'japanread';
        super.label = 'Japanread';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://www.japanread.cc';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'h1.card-header');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(new URL('/manga-list', this.url), this.requestOptions);
        let pages = await this.fetchDOM(request, 'ul.pagination li.page-item:nth-last-child(2) > a');
        pages = Number(pages[0].text);

        let mangas = [];
        for (let page = 0; page <= pages; page++) {
            request = new Request(new URL('/manga-list?page=' + page, this.url), this.requestOptions);
            let data = await this.fetchDOM(request, 'a.text-truncate', 5);
            mangas.push( ...data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.innerText.trim()
                };
            }));
        }

        return mangas;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'a.text-truncate');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim(),
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let id = await this.fetchDOM(request, 'head meta[data-chapter-id]');
        let data = await this.fetchJSON(this.url + '/api/?type=chapter&id=' + id[0].dataset.chapterId);
        return data.page_array.map( page => this.getAbsolutePath( data.baseImagesUrl + '/' + page, request.url ) );
    }
}