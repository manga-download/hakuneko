import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
//mnanauk theme/template
export default class Sa3i9a extends Connector {

    constructor() {
        super();
        super.id = 'sa3i9a';
        super.label = 'sa3i9a (موقع صاعقة)';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://sa3i9a.org';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#content h1');
        const id = uri.pathname + uri.search;
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        page = page === 1 ? '' : page;
        const request = new Request(new URL(`/قائمة-المانجا-${page}/`, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.item.red > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace('مانجا', '').trim()
            };
        });
    }

    async _getChapters(manga) {
        let chaptersList = [];
        let req;
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, '#post-nav > div > a:last-child');
        for(let page = 1, run = true; run; page++) {
            if (data.length == 0) {
                req = manga.id;
                run = false;
            } else {
                req = data[0].href.replace(/page\/(\d+)/, `page/${page}`);
            }
            let chapters = await this._getChaptersFromPage(req);
            chapters.length > 0 ? chaptersList.push(...chapters) : run = false;
        }
        return chaptersList;
    }
    async _getChaptersFromPage(req) {
        const data = await this.fetchDOM(new Request(new URL(req, this.url), this.requestOptions), 'div.ft-ctbox h2 > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'section source');
        return data.map(element => this.getAbsolutePath(element.dataset.src, request.url));
    }
}