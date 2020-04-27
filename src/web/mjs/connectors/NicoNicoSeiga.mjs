import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NicoNicoSeiga extends Connector {

    constructor() {
        super();
        super.id = 'niconicoseiga';
        super.label = 'ニコニコ静画 (niconico seiga)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://seiga.nicovideo.jp';

        this.mangaListPage = "/manga/list";
        this.mangaListEndPoint = "/ajax/manga/list";

        this.querySeriesCount = 'div#main div#mg_main_column';

        this.queryMangaTitle = 'div.main_title h1';

        this.queryChapters = 'div.mg_episode_list div.inner ul li.episode_item div.episode div.description div.title a';

        this.queryPages = 'div.pages ul#page_contents li.page div.note source.lazyload';
        this.pageTemplateURL = 'https://seiga.nicovideo.jp/image/source/';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangaTitle);
        let id = uri.pathname;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangasFromRequest(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.map(series => {
            return {
                id: this.getRootRelativeOrAbsoluteLink('/comic/' + series.id, request.url),
                title: series.title
            };
        });
    }

    async _getMangas() {
        let request = new Request(new URL(this.mangaListPage, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.querySeriesCount);
        let totalPages = Math.ceil(data[0].dataset.count/10);
        let mangaList = [];
        let uri = new URL(this.mangaListEndPoint, this.url);
        for(let page = 1; page <= totalPages; page++) {
            uri.searchParams.set('page', page);
            let mangas = await this._getMangasFromRequest(uri);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getChapters(manga) {
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.textContent
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return data.map(element => this.pageTemplateURL + element.dataset.imageId).sort();
    }
}