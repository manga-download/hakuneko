import CoreView from './templates/CoreView.mjs';

export default class KurageBunch extends CoreView {

    constructor() {
        super();
        super.id = 'kuragebunch';
        super.label = 'くらげバンチ (KurageBunch)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://kuragebunch.com';

        this.queryManga = 'ul.page-series-list li.page-series-list-item div.series-data a.series-data-container';
        this.queryMangaTitle = 'h4';
    }
}