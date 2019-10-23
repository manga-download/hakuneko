import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NineHentai extends Connector {

    constructor() {
        super();
        super.id = '9hentai';
        super.label = '9hentai';
        this.tags = ['hentai', 'multi-lingual'];
        this.url = 'https://9hentai.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[property="og:title"]', 3);
        let id = uri.pathname.match(/\/(\d+)\/?$/)[1];
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangaList(callback) {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        callback( new Error( msg ), undefined );
    }

    async _getChapterList(manga, callback) {
        try {
            let chapterList = [ Object.assign({ language: '' }, manga) ];
            callback(null, chapterList);
        } catch(error) {
            console.error(error, manga);
            callback(error, undefined);
        }
    }

    async _getPageList(manga, chapter, callback) {
        try {
            let request = this._createPageListRequest(chapter.id);
            let data = await this.fetchJSON(request);
            let pageList = [...new Array(data.results.total_page).keys()].map(page => {
                return data.results.image_server + data.results.id + '/' + (page + 1) + '.jpg';
            });
            callback(null, pageList);
        } catch(error) {
            console.error(error, chapter);
            callback(error, undefined);
        }
    }

    _createPageListRequest(chapterID) {
        this.requestOptions.method = 'POST';
        this.requestOptions.body = `{"id": ${chapterID}}`;
        this.requestOptions.headers.set('content-type', 'application/json');
        let request = new Request(this.url + '/api/getBookByID', this.requestOptions);
        this.requestOptions.headers.delete('content-type');
        this.requestOptions.method = 'GET';
        delete this.requestOptions.body;
        return request;
    }
}