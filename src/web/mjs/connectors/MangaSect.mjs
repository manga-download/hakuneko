import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaSect extends Connector {

    constructor() {
        super();
        super.id = 'mangasect';
        super.label = 'MangaSect';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mangasect.com';
        this.path = '/all-manga/';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'header h1');
        return new Manga(this, uri.pathname, data[0].textContent.trim());
    }

    async _getMangas() {
        let mangaList = [];
        const uri = new URL(this.path, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, "ul.pagination");
        const paginationInfo = data[0].children[0].innerText;
        const rawPageCount = paginationInfo.split("/");
        const pageCount = parseInt(rawPageCount[1]);
        for(let page = 1; page <= pageCount; page++) {
        const mangas = await this._getMangasFromPage(page);
        mangaList.push(...mangas);
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        const uri = new URL(this.path + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, "figure.clearfix div.image a");
        return data.map((element) => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title,
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, "div.chapter a");
        return data.map((element) => {
        return {
            id: this.getRootRelativeOrAbsoluteLink(element, this.url),
            title: element.text.trim(),
        };
        });
    }

    async _getPages(chapter) {
        const referer = new URL(chapter.id, this.url);
        const request = new Request(referer, this.requestOptions);
        request.headers.set("x-referer", referer);
        request.headers.set("X-Requested-With", "XMLHttpRequest");
        const response = await this.fetchDOM(request);
        const regex = /const\s+CHAPTER_ID\s+=\s+(\d+);/;
        const match = regex.exec(response.innerText);
        const chapterId = match[1];
        const uri = new URL("/ajax/image/list/chap/" + chapterId, this.url);
        const ajaxReq = new Request(uri, this.requestOptions);
        ajaxReq.headers.set("x-referer", referer);
        ajaxReq.headers.set("X-Requested-With", "XMLHttpRequest");
        const ajaxResponse = await this.fetchJSON(ajaxReq);
        const dom = this.createDOM(ajaxResponse.html);
        const ajaxData = dom.querySelectorAll("source[data-real]");
        return Array.from(ajaxData).map((image) =>
        this.getAbsolutePath(image.dataset["real"], ajaxReq.url)
        );
    }
}
