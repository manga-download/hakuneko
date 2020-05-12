import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Kuimh extends Connector {
    constructor() {
        super();
        super.id = 'kuimh';
        super.label = '酷爱漫画 (Kuimh)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.kuimh.com';

        this.path = '/booklist?page=1/';
        this.pathMatch = 'page=(\\d+)';
        this.queryMangasPageCount = 'div.page-pagination div.pagination li:nth-last-child(2) a';
        this.queryPages = 'div.comiclist div.comicpage source';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'section.banner_detail div.info h1');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + this.path, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryMangasPageCount);
        let pageCount = parseInt(new RegExp(this.pathMatch).exec(data[0].href)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let request = new Request(new URL(`/booklist?page=${page}`, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.mh-list li div.mh-item-detali h2.title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        console.log(manga);
        console.log(manga.id);
        let request = new Request(new URL(this.url + manga.id), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#chapterlistload ul#detail-list-select li a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.childNodes[0].nodeValue.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        console.log(data);
        return data.map(element => {
            let src = (element.dataset['echo'] || element.src).trim();
            if(src.startsWith('//')) {
                src = new URL(this.url).protocol + src;
            }
            return src;
        });
    }
}