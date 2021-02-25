import CoreView from './templates/CoreView.mjs';

export default class ShonenMagazinePocket extends CoreView {

    constructor() {
        super();
        super.id = 'shonenmagazine-pocket';
        super.label = 'マガジンポケット (Shonen Magazine Pocket)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://pocket.shonenmagazine.com';
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Linux; Android 9; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4026.0 Mobile Safari/537.36');
        
        this.path = [ '/series' ];
        this.queryManga = 'div.series-items ul.daily-series > li.daily-series-item > a';
        this.queryMangaTitle = 'h4.daily-series-title';
    }
}
