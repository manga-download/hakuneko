import Publus from './templates/Publus.mjs';
import Manga from '../engine/Manga.mjs';

export default class JumpBookStore extends Publus {

    constructor() {
        super();
        super.id = 'jumpbookstore';
        super.label = 'ジャンプBOOKストア (Jump Book Store)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://jumpbookstore.com';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'head meta[property="og:title"]');
        return new Manga(this, uri.pathname, data[0].content.trim());
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL('/item_list.html', this.url);
        uri.searchParams.set('SEARCH_MAX_ROW_LIST', 100);
        uri.searchParams.set('item_list_mode', 1);
        uri.searchParams.set('sort_order', 4);
        uri.searchParams.set('request', 'page');
        uri.searchParams.set('next_page', page);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.item_list_img a.panel_search_image');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('source.comics_image').getAttribute('alt').trim()
            };
        });
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.comics_detail_info');
        const id = data[0].querySelector('p.cid').textContent.trim();
        const title = data[0].querySelector('h2.comics_detail_title').textContent.trim();
        return [{
            id: '/client_info/SHUEISHA/html/player/viewer.html?tw=2&lin=1&cid=' + id,
            title: title
        }];
    }
}