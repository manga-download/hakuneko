import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NineEkor extends Connector {

    constructor() {
        super();
        super.id = '9ekor';
        super.label = '9ekor';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://9ekor.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.page-head h1.page-title');
        let id = uri.pathname.split('page/')[0];
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let request = new Request(new URL('/daftar-isi/', this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.pt-cv-view div.pt-cv-taso a.pt-cv-tao');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        let request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.pagination > a.last');
        let pageCount = data.length === 0 ? 1 : parseInt(data[0].href.match(/page\/(\d+)\//)[1]);
        for(let page = 1; page <= pageCount; page++) {
            let chapters = await this._getChaptersFromPage(manga, page);
            chapterList.push(...chapters);
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, page) {
        let request = new Request(new URL(`${manga.id}page/${page}/`, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'article.item-list h2.post-box-title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.text.replace(manga.title, '').replace(/Baca komik/i, '').replace(/Bahasa Indonesia/i, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#all source');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}