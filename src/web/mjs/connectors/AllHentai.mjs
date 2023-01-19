import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class AllHentai extends Connector {

    constructor() {
        super();
        super.id = 'allhentai';
        super.label = 'AllHentai';
        this.tags = ['hentai', 'russian'];
        this.url = 'https://2023.allhen.online';
        this.links = {
            login: 'https://2023.allhen.online/internal/auth'
        };
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'meta[itemprop="name"]', 3);
        let id = uri.pathname;
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 0, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/list?offset=' + page*70, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#mangaBox div.desc h3 a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.chapters-link table tr td a[title]');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title : element.text.replace(manga.title, '').trim(),
            };
        });
    }

    async _getPages(chapter) {
        //check if person is connected
        let uri = new URL(this.url);
        let request = new Request( uri, this.requestOptions );
        let token = await Engine.Request.fetchUI( request,
            `new Promise( resolve =>
                 resolve(document.cookie) 
          )`
        );

        token = token.match(/gwt=([\S]+)/);
        if(!token) throw new Error('You must be logged to view chapters pages !');

        let script = `new Promise(resolve => {
                resolve(rm_h.pics.map(picture => picture.url));
        });`;

        uri = new URL(chapter.id, this.url);
        request = new Request(uri, this.requestOptions);
        const data = await Engine.Request.fetchUI( request, script);
        return data.map(element => this.getAbsolutePath(element, this.url));

    }

}
