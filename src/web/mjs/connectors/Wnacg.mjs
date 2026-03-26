import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Wnacg extends Connector {

    constructor() {
        super();
        super.id = 'wnacg';
        super.label = 'wnacg';
        this.tags = [ 'hentai', 'porn', 'japanese' ];
        this.url = 'https://www.wnacg.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#bodywrap > h2');
        const id = uri.pathname;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        const request = new Request(new URL('/albums.html', this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.paginator > a:last-of-type');
        const pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL(`/albums-index-page-${page}.html`, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'ul li.gallary_item div.info div.title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'ul li.gallary_item div.pic_box > a:first-of-type');
        return [ {
            id: this.getRootRelativeOrAbsoluteLink(data.shift(), this.url),
            title: manga.title,
            language: ''
        } ];
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.newpage select.pageselect option');
        return data.map(option => this.createConnectorURI(`/photos-view-id-${option.value}.html`));
    }

    async _handleConnectorURI(payload) {
        const request = new Request(new URL(payload, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'source#picarea');
        return super._handleConnectorURI(this.getAbsolutePath(data[0], request.url));
    }
}