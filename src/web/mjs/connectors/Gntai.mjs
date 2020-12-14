import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Gntai extends Connector {

    constructor() {
        super();
        super.id = 'gntai';
        super.label = 'GNTAI';
        this.tags = [ 'hentai', 'spanish' ];
        this.url = 'http://www.gntai.net';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'main header.entry-header h1');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(new URL(this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.navigation ul li:last-of-type a');
        let pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(`/page/${page}/`, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'main article div.chapter-thumb > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        return [ Object.assign({ language: '' }, manga) ];
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions );
        return await this.fetchRegex(request, /['"]page_image['"]\s*:\s*['"]([^'"]+)['"]/g);
    }
}