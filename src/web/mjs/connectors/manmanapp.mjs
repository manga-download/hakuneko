import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ManmanApp extends Connector {

    constructor() {
        super();
        super.id = 'manmanapp';
        super.label = 'Manman Comic 漫漫漫画';
        this.tags = [ 'manga', 'webtoon', 'chineses' ];
        this.url = 'https://www.manmanapp.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'li.title');
        const id = uri.pathname + uri.search;
        const title = data[0].firstChild.textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        const request = new Request(new URL('/comic/category_1.html', this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.paging li:last-of-type > a');
        const pageCount = parseInt(data[0].href.match(/(\d+).html/)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL(`/comic/category_${page}.html`, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'li.title > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chaptersList = [];
        const id = manga.id.match(/(\d+).html/)[1];
        for(let page = 1, run = true; run; page++) {
            let chapters = await this._getChaptersFromPage(page, id);
            chapters.length > 0 ? chaptersList.push(...chapters) : run = false;
        }
        return chaptersList;
    }

    async _getChaptersFromPage(page, id) {
        const request = new Request(new URL('/works/comic-list-ajax.html', this.url), {
            method: 'POST',
            body: new URLSearchParams({
                id: id,
                sort: 0,
                page: page
            })
        });
        const datt = await this.fetchJSON(request);
        return datt.code == 1 ? datt.data.map(element => {
            return {
                id: '/comic/detail-'+element.id+'.html',
                title: element.title
            };
        }): [];
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'source.man_img');
        return data.map(ele => this.getAbsolutePath(ele, request.url));
    }
}