import CoreView from './templates/CoreView.mjs';

export default class KurageBunch extends CoreView {

    constructor() {
        super();
        super.id = 'kuragebunch';
        super.label = 'くらげバンチ (KurageBunch)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://kuragebunch.com';
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Linux; Android 9; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4026.0 Mobile Safari/537.36');
        
        this.path = [ '/series/kuragebunch', '/series/comicbunch', '/series/bbunch', '/series/ututu', '/series/oneshot' ];
        this.queryManga = 'ul.page-series-list li.page-series-list-item div.series-data a.series-data-container';
        this.queryMangaTitle = 'h4';
    }
}
