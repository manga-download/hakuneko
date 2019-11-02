import Connector from '../engine/Connector.mjs';

export default class InManga extends Connector {

    constructor() {
        super();
        super.id = 'inmanga';
        super.label = 'InManga';
        this.tags = [ 'manga', 'spanish' ];
        this.url = 'https://inmanga.com';
    }

    _createPostRequest(uri, form) {
        this.requestOptions.method = 'POST';
        this.requestOptions.body = form;
        this.requestOptions.headers.set('content-type', 'application/x-www-form-urlencoded');
        let request = new Request(uri, this.requestOptions);
        this.requestOptions.headers.delete('content-type');
        delete this.requestOptions.body;
        this.requestOptions.method = 'GET';
        return request;
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 0, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL('/manga/getMangasConsultResult', this.url);
        let formManga = new URLSearchParams();
        formManga.set('filter[generes][]', -1);
        formManga.set('filter[queryString]', '' );
        formManga.set('filter[skip]', 500 * page);
        formManga.set('filter[take]', 500);
        formManga.set('filter[sortby]', 5);
        formManga.set('filter[broadcastStatus]', 0);
        formManga.set('filter[onlyFavorites]', false);
        let request = this._createPostRequest(uri, formManga.toString());
        let data = await this.fetchDOM(request, 'a.manga-result');
        return data.map(element => {
            return {
                id: element.href.split('/').filter(part => part !== '').pop(),
                title: element.querySelector('h4.ellipsed-text').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL('/chapter/getall', this.url);
        uri.searchParams.set('mangaIdentification', manga.id);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        data = JSON.parse(data.data).result;
        return data.map(item => {
            return {
                id: item.Identification, // item.Id,
                title: item.FriendlyChapterNumber, // item.Number, item.Description
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL('/chapter/chapterIndexControls', this.url);
        uri.searchParams.set('identification', chapter.id);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.PagesContainer source.ImageContainer');
        return data.map(element => this.getAbsolutePath('/page/getPageImage/?identification=' + element.id, request.url));
    }
}