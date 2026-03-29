import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class XlecX extends Connector {

    constructor() {
        super();
        super.id = 'xlecx';
        super.label = 'XlecX';
        this.tags = [ 'hentai', 'porn', 'english' ];
        this.url = 'https://xlecx.one';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'main div#dle-content div.full-in h1');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        const request = new Request(new URL(this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.pagi-nav div.navigation a:nth-last-of-type(2)');
        const pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL(`/page/${page}/`, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'main div#dle-content div.thumb a.th-title');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        return [ Object.assign({ language: '' }, manga) ];
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions );
        const data = await this.fetchDOM(request, 'div.f-desc source');
        return data.map(element => this.getAbsolutePath(element.dataset.src, request.url));
    }
}
