import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class MHXK extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.tags = [];
        this.url = 'http://www.mhxk.com';
        this.apiURL = 'https://cms-webapi.321mh.com';
        this.subdomain = 'mhpic.';

        this.queryMangaTitle = 'h1#detail-title';
        // customer specific information for API requests
        this.product = {
            id: 0,
            name: '',
            platform: 'pc'
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangaTitle);
        let id = data[0].dataset.comicId;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    _createProviderURI(endpoint) {
        let uri = new URL('/api/v1/info' + endpoint, this.apiURL);
        uri.searchParams.set('product_id', this.product.id);
        uri.searchParams.set('productname', this.product.name);
        uri.searchParams.set('platformname', this.product.platform);
        return uri;
    }

    _createCustomerURI(endpoint) {
        let uri = new URL('/api' + endpoint, this.url);
        return uri;
    }

    async _getMangas() {
        let uri = this._createCustomerURI('/getComicList/');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.data.map(manga => {
            return {
                id: manga.comic_id, // manga.comic_newid
                title: manga.comic_name
            };
        });
    }

    async _getChapters(manga) {
        let uri = this._createCustomerURI('/getComicInfoBody/');
        uri.searchParams.set('comic_id', manga.id);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.data.comic_chapter.map(chapter => {
            return {
                id: chapter.chapter_newid, // chapter.chapter_id
                title: chapter.chapter_name,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = this._createCustomerURI('/getchapterinfo');
        uri.searchParams.set('comic_id', chapter.manga.id);
        uri.searchParams.set('chapter_newid', chapter.id);
        let request = new Request(uri, this.requestOptions );
        let data = (await this.fetchJSON(request)).data.current_chapter;
        let pages = [];
        for(let index = data.start_num; index <= data.end_num; index++) {
            let page = new URL(data.rule.replace('$$', index), request.url);
            page.hostname = this.subdomain + data.chapter_domain;
            page.pathname += `-${this.product.name}.middle.jpg`; // low | middle | high (high seems premium only)
            pages.push(page.href);
        }
        return pages;
    }
}