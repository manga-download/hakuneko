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
        let data = await this.fetchDOM(request, 'div.card-manga h1.card-header');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/manga-list?page=' + page, this.url);
        const request = new Request(uri, {
            method: 'POST',
            body: 'list_view=3',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        const data = await this.fetchDOM(request, 'div.row a.manga_title');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.chapter-container div.chapter-row a.text-truncate');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id, this.url);
        let request = new Request(uri, this.requestOptions);
        const id = await this.fetchDOM(request, 'head meta[data-chapter-id]');
        uri = new URL('/api/?type=chapter&id=' + id[0].dataset.chapterId, this.url);
        request = new Request(uri, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        let data = await this.fetchJSON(request);
        return data.page_array.map( page => this.getAbsolutePath( data.baseImagesUrl + '/' + page, request.url ) );
    }
}