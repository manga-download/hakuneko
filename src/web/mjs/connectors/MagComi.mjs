import CoreView from './templates/CoreView.mjs';
import Manga from '../engine/Manga.mjs';

export default class MagComi extends CoreView {

    constructor() {
        super();
        super.id = 'magcomi';
        super.label = 'MAGCOMI';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://magcomi.com';

        this.path = [ '/series' ];
        this.queryManga = 'ul.magcomi-series-list > li.series-item > a';
        this.queryMangaTitle = 'h3.series-title';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'head title');
        let id = uri.pathname;
        let title = data[0].text.split('|')[0].trim();
        return new Manga(this, id, title);
    }
}