import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Mangafast extends Connector {

    constructor() {
        super();
        super.id = 'mangafast';
        super.label = 'Mangafast';
        this.tags = [ 'manga', 'webtoon', 'english'];
        this.url = 'https://mangafast.net';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#article-info div.info > span > b');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
            run = mangas.continue;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(`/list-manga/page/${page}/`, this.url);
        const request = new Request(uri, this.requestOptions);
        const body = (await this.fetchDOM(request, 'body'))[0];
        const nextLink = body.querySelector('main section div.btn-w > a:last-of-type');
        const hasNextLink = nextLink ? /next/i.test(nextLink.text) : false;
        const data = [...body.querySelectorAll('div.list-content div.ls4j h3 a')];
        const mangas = data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
        mangas['continue'] = hasNextLink;
        return mangas;
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.chapter-link-w a.chapter-link');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.querySelector('span.left').textContent.replace(manga.title, '').trim()
            };
        });
    }

    async _getPages(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'section.read-comic div.content-comic source');
        return data.map(element => this.getAbsolutePath(element.dataset['src'] || element.dataset['data-src'] || element, request.url)).filter(link => !link.includes('adskeeper.co.uk'));
    }
}