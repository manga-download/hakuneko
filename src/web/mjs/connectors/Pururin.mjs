import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class Pururin extends Connector {
    constructor() {
        super();
        super.id = 'pururin';
        super.label = 'Pururin';
        this.tags = ['manga', 'hentai', 'english'];
        this.url = 'https://pururin.to';
        this.path = "/browse/title";
        this.queryMangasPageCount = 'ul.pagination.flex-wrap li:nth-last-of-type(2) a';
        this.queryMangas = 'a.card.card-gallery';
        this.queryChapters ='div.gallery-action a:first-of-type';
        this.queryPages ='.img-viewer';
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
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters );
        return [{title : 'Chapter', id : data[0].pathname}];

    }
    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages );
        const imgdata = JSON.parse(data[0].dataset['img']);
        const server = data[0].dataset['svr'];
        const directory = imgdata.directory;
        return imgdata.images.map(page => new URL(`${directory}/${page.filename}`, server).href);

    }
    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.title h1 span' );
        const title = data[0].textContent.trim();
        const id = this.getRootRelativeOrAbsoluteLink(uri, this.url);
        return new Manga(this, id, title);
    }
}
