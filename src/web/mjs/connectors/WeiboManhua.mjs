import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class WeiboManhua extends Connector {

    constructor() {
        super();
        super.id = 'weibomanhua';
        super.label = '微博动漫 (Weibo Manhua)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'http://manhua.weibo.com';
        this.apiURL = 'http://apiwap.vcomic.com';
    }

    async _getMangaFromURI(uri) {
        let id = parseInt(uri.pathname.match(/\/(\d+)$/)[1]);
        uri = new URL('/wbcomic/comic/comic_show', this.apiURL);
        uri.searchParams.set('comic_id', id);
        uri.searchParams.set('_request_from', 'pc');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        let title = data.data.comic.name;
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
        let uri = new URL('/wbcomic/comic/filter_result', this.apiURL);
        uri.searchParams.set('page_num', page);
        uri.searchParams.set('rows_num', 250);
        uri.searchParams.set('cate_id', 0);
        uri.searchParams.set('end_status', 0);
        uri.searchParams.set('comic_pay_status', 0);
        uri.searchParams.set('_request_from', 'pc');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.data.data.map(manga => {
            return {
                id: manga.comic_id,
                title: manga.comic_name
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL('/wbcomic/comic/comic_show', this.apiURL);
        uri.searchParams.set('comic_id', manga.id);
        uri.searchParams.set('_request_from', 'pc');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.data.chapter_list.map(chapter => {
            return {
                id: chapter.chapter_id,
                title: chapter.chapter_name,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL('/wbcomic/comic/comic_play', this.apiURL);
        uri.searchParams.set('chapter_id', chapter.id);
        uri.searchParams.set('_request_from', 'pc');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchJSON(request);
        return data.data.json_content.page.map(page => {
            let image = page.newImgUrl || page.newWebpImgUrl || page.mobileImgUrl || page.mobileWebpImgUrl;
            return this.getAbsolutePath(image, request.url);
        });
    }
}