import CoreView from './templates/CoreView.mjs';

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
}