import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

// Theme: https://themesia.com/mangastream-wordpress-theme/
export default class WordPressMangastream extends Connector {

    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.url = undefined;

        this.mangaDirectory = '/manga/';
        this.queryMangas = 'div#content div.postbody div.listupd div.bs div.bsx a';
        this.queryChapters = 'div#content div.postbody article ul li span.lchx a';
        this.queryPages = 'div#content div.postarea article div#readerarea source';
        this.querMangaTitleFromURI = 'div#content div.postbody article div.infox h1';
    }

    _createMangaRequest(page) {
        let uri = new URL(this.mangaDirectory, this.url);
        uri.searchParams.set('page', page);
        let request = new Request(uri, this.requestOptions);
        return request;
    }

    async _getMangasFromPage(page) {
        let request = this._createMangaRequest(page);
        let data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.trim()
            };
        });
    }

    async _getMangas() {
        let mangaList = [];

        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }

        return mangaList;
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryChapters);

        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);

        return data.map(element => this.getAbsolutePath(element, request.url));
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.querMangaTitleFromURI);
        const title = data[0].textContent.trim();

        return new Manga(this, uri, title);
    }
}