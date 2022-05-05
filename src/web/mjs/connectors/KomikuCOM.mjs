import WordPressMangastream from './templates/WordPressMangastream.mjs';
import Manga from '../engine/Manga.mjs';

export default class KomikuCOM extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikucom';
        super.label = 'Komiku.COM';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://komiku.com';
        this.path = '/manga/list-mode/';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.querMangaTitleFromURI);
        return new Manga(this, uri.pathname, data[0].textContent.trim().replace(/^Komik\s*/i, ''));
    }
}