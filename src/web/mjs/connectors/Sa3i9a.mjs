import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Sa3i9a extends Connector {

    constructor() {
        super();
        super.id = 'sa3i9a';
        super.label = 'sa3i9a (موقع صاعقة)';
        this.tags = [ 'manga', 'webtoon', 'arabic' ];
        this.url = 'https://sa3i9a.org';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, '#content h1');
        console.log(data)
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
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
        if (page == 1) {page = ''};
        let request = new Request(new URL(`/قائمة-المانجا-${page}/`, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.item.red > a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace('مانجا','').trim()
            };
        });
    }

    async _getChapters(manga) {
        let ChaptersList = [];
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, '#post-nav > div > a:last-child');
        for(let page = 1, run = true; run; page++) {
            let Chapters = await this._getChaptersFromPage(page,data[0].href,manga);
            Chapters.length > 0 ? ChaptersList.push(...Chapters) : run = false;
        }
        return ChaptersList;
    }
    async _getChaptersFromPage(page,link,manga){
        let request = new Request(new URL(link.replace(/page\/(\d+)/,`page/${page}`), this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.ft-ctbox h2 > a');
        console.log(data)
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.replace('مانجا','').replace(new RegExp(manga.title,'i'),'').replace('مترجم','').replace('الفصل','').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.content_chap source');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}