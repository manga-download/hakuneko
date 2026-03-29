import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class BookLive extends SpeedBinb {

    constructor() {
        super();
        super.id = 'booklive';
        super.label = 'BookLive';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://booklive.jp';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div#product_detail_area div.product_info > h1#product_display_1', 3);
        let id = uri.pathname;
        let title = data[0].innerText.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        // https://booklive.jp/select/title/page_no/5012
        const msg = 'This website does not support mangas/chapters, please copy and paste the links containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#product_detail_area div.product_actions ul a.bl-bviewer');
        return data.map(element => {
            return {
                id: '/bviewer/s/?cid=' + element.dataset.title + '_' + element.dataset.vol,
                title: element.dataset.vol.trim(),
                language: ''
            };
        });
    }
}