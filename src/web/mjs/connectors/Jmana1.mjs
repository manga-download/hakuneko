import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Jmana1 extends Connector {
    constructor() {
        super();
        super.id = 'jmana1';
        super.label = '제이마나 (Jaymana)';
        this.tags = [ 'manga', 'korean' ];
        this.url = 'https://kr21.jmana.one';
        this.requestOptions.headers.set('x-referer', this.url);

        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may reject to many consecuitive requests',
                input: 'numeric',
                min: 10000,
                max: 25000,
                value: 10000
            }
        };
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname + uri.search;
        const title = (await this.fetchDOM(new Request(uri, this.requestOptions), 'div.books-db-detail a.tit')).pop().text.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        // NOTE: Avoid 429 Too Many Request
        await this.wait(this.config.throttle.value);
        const uri = new URL('/comic_list', this.url);
        uri.searchParams.set('page', page);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'ul li.etc div.txt-wrap a.tit');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.lst-wrap ul li div.inner a.tit');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace(manga.title, '').trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.view-wrap source.comicdetail');
        return data.map(img => this.createConnectorURI(this.getAbsolutePath(img.dataset['src'] || img['srcset'] || img, request.url)));
    }
}
