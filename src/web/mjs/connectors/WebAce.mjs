import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class WebAce extends Connector {

    constructor() {
        super();
        super.id = 'webace';
        super.label = 'webエース (web ace)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://web-ace.jp';
    }

    async _getMangaFromURI(uri) {
        uri.pathname = uri.pathname.split('comics/')[0];
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#sakuhin-info div.credit h1');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 0, run = true; run; page += 20) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        // NOTE: only mangas with ID >= 1000000 have chapters for online reading
        return mangaList.filter(manga => /\d{7}\/?$/.test(manga.id));
    }

    async _getMangasFromPage(page) {
        let uri = new URL(`/schedule/${page}/`, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.row div.col div.box');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.querySelector('a'), this.url).split('comics/')[0],
                title: element.querySelector('h3').textContent.replace(/\(\d+\)$/, '').trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id + (manga.id.endsWith('episode/') ? '' : 'episode/'), this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#read ul.table-view li.media:not(.yudo) a.navigate-right');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('div.media-body p.text-bold').textContent.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL(chapter.id + (chapter.id.endsWith('json/') ? '' : 'json/'), this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.map(image => new URL(image, request.url).href);
    }
}