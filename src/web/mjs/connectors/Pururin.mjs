import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class Pururin extends Connector {
    constructor() {
        super();
        super.id = 'pururin';
        super.label = 'Pururin';
        this.tags = ['manga', 'hentai', 'english'];
        this.url = 'https://pururin.to';
        this.CDN = "https://cdn.pururin.to/assets/images/data/{1}/{2}.{3}";
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
        let mid = this.getRootRelativeOrAbsoluteLink(manga.id, this.url);
        const chapters = [{ id: mid, title: 'Chapter' }];
        return chapters;
    }
    async _getPages(chapter) {
        let queryPicture = '';
        let pictures = [];
        var myRegexp = new RegExp('gallery\/([0-9]+)', 'g');
        var match = myRegexp.exec(chapter.id);
        let mangaID = match[1];
        let params = '{"id":'+mangaID+',"type":2}';
        const uri = new URL(this.api, this.url);
        const request = new Request(uri, {
            method: 'POST',
            body: params,
            headers: {
                'x-origin': this.url,
                'x-referer': this.url,
                'Content-Type': 'application/json;charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
            }
        });
        const data = await this.fetchJSON(request);
        let pagesMax = data.gallery.total_pages;
        let extension = data.gallery.image_extension;
        //https://cdn.pururin.to/assets/images/data/<mangaid>/<i>.image_extension
        for (var i = 1; i <= pagesMax; i++) {
            let imageuri = this.CDN.replace('{1}', mangaID).replace('{2}', i).replace('{3}', extension);
            pictures.push(imageuri);
        }
        return pictures;
    }
    async _getMangaFromURI(uri) {
        var myRegexp = new RegExp('gallery\/([0-9]+)', 'g');
        var match = myRegexp.exec(uri.href);
        let mangaID = match[1];
        let params = '{"id":'+mangaID+',"type":2}';
        const req = new URL(this.api, this.url);
        const request = new Request(req, {
            method: 'POST',
            body: params,
            headers: {
                'x-origin': this.url,
                'x-referer': this.url,
                'Content-Type': 'application/json;charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
            }
        });
        const data = await this.fetchJSON(request);
        const title = data.gallery.title;
        const id = this.getRootRelativeOrAbsoluteLink(uri, this.url);
        return new Manga(this, id, title);
    }
}