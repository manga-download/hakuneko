import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class Pururin extends Connector {
    constructor() {
        super();
        super.id = 'pururin';
        super.label = 'Pururin';
        this.tags = ['manga', 'hentai', 'english'];
        this.url = 'https://pururin.to';
        this.CDN = "https://cdn.pururin.to/assets/images/data/";
        this.path = "/browse/title";
        this.api = "/api/contribute/gallery/info";
        this.queryMangasPageCount = 'ul.pagination.flex-wrap li:nth-last-of-type(2) a';
        this.queryMangas = 'a.card.card-gallery';
        this.queryChapters ='div.gallery-action a';
        this.requestOptions.headers.set('x-referer', this.url);
        this.requestOptions.headers.set('x-origin', this.url);
    }
    async _getMangas() {
        let mangaList = [];
        const uri = new URL(this.path, this.url);
        const request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangasPageCount);
        let pageCount = parseInt(data[0].text);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        let uri = new URL(this.path + '?page='+page, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('source.card-img-top').getAttribute('alt').trim()
            };
        });
    }
    async _getChapters(manga) {
        return [{ id: manga.id, title: 'Chapter' }];
    }
    async _getPages(chapter) {
        let mangaID = chapter.id.match(/\/gallery\/([0-9]+)/)[1];
        const uri = new URL(this.api, this.url);
        const request = this.getApiRequest(uri, mangaID);
        const data = await this.fetchJSON(request);
        let pagesMax = data.gallery.total_pages;
        let extension = data.gallery.image_extension;
        //https://cdn.pururin.to/assets/images/data/<mangaid>/<i>.image_extension
        return new Array(pagesMax).fill().map((_, index) => new URL(`${this.CDN}/${mangaID}/${index + 1}.${extension}`).href);
    }
    async _getMangaFromURI(uri) {
        let mangaID = uri.href.match(/\/gallery\/([0-9]+)/)[1];
        const req = new URL(this.api, this.url);
        const request = this.getApiRequest(req, mangaID);
        const data = await this.fetchJSON(request);
        const title = data.gallery.title;
        const id = this.getRootRelativeOrAbsoluteLink(uri, this.url);
        return new Manga(this, id, title);
    }
    getApiRequest(url, id) {
        let params = {
            id: id,
            type:2
        };
        return new Request(url, {
            method: 'POST',
            body: JSON.stringify(params),
            headers: {
                'x-origin': this.url,
                'x-referer': this.url,
                'Content-Type': 'application/json;charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
            }
        });
    }
}
