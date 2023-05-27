import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Naver extends Connector {

    constructor() {
        super();
        super.id = 'naver';
        super.label = '네이버 웹툰 (Naver Webtoon)';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://comic.naver.com';
        this.links = {
            login: 'https://nid.naver.com/nidlogin.login'
        };
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[property="og:title"]');
        const id = uri.searchParams.get('titleId');
        const title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        throw new Error('This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.');
    }

    async _getChapters(manga) {
        const chapterList = [];
        for(let page = 1, run = true; run; page++) {
            const chapters = await this._getChaptersFromPage(manga.id, page);
            if(chapters.length > 0 && (chapterList.length === 0 || chapters[chapters.length - 1].id !== chapterList[chapterList.length - 1].id)) {
                chapterList.push(...chapters);
            } else {
                run = false;
            }
        }
        return chapterList;
    }

    async _getChaptersFromPage(mangaID, page) {
        const url = new URL(`/api/article/list?titleId=${mangaID}&page=${page}`, this.url);
        const request = new Request(url, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.articleList.map(element => {
            return {
                id : element.no,
                title : element.subtitle
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(`/webtoon/detail?titleId=${chapter.manga.id}&no=${chapter.id}`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#comic_view_area div.wt_viewer source[id^="content_image"]');
        return data.map(element => this.getAbsolutePath(element, request.url));
    }
}
