import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaJar extends Connector {

    constructor() {
        super();
        super.id = 'mangajar';
        super.label = 'MangaJar';
        this.tags = ['manga', 'english', 'scanlation', 'webtoon'];
        this.url = 'https://mangajar.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'span.post-name');
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(`/manga?page=${page}`, this.url));
        let data = await this.fetchDOM(request, 'div.row article.flex-item div.post-description a.card-about');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('p.card-title').textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id.replace(/\/$/, '') + '/chaptersList', this.url));
        let pages = await this.fetchDOM(request, 'div.chapters-infinite-pagination ul.pagination a:last-of-type');
        let pageCount = pages.length > 0 ? parseInt(pages.slice(-2)[0].href.match(/page=(\d+)$/)[1]) : 1;
        let chapterList = [];
        const uri = new URL(manga.id + '/chaptersList', this.url);
        for (let page of new Array(pageCount).keys()) {
            uri.searchParams.set('page', page + 1);
            let request = new Request(uri, this.requestOptions);
            let data = await this.fetchDOM(request, 'ul.list-group li.chapter-item a');
            let chapters = data.map(element => {
                return {
                    id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                    title: element.innerText.trim(),
                    language: ''
                };
            });
            chapterList = chapterList.concat(chapters);
        }
        return chapterList;
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url));
        let data = await this.fetchDOM(request, 'source.page-image');
        return data.map(element => {
            return this.getAbsolutePath(element.dataset.src || element, request.url);
        });
    }
}