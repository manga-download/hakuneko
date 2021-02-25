import CoreView from './templates/CoreView.mjs';

export default class ShonenMagazine extends CoreView {

    constructor() {
        super();
        super.id = 'shonenmagazine';
        super.label = '週刊少年マガジ (Weekly Shonen Magazine)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://shonenmagazine.com';
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Linux; Android 9; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4026.0 Mobile Safari/537.36');
        
        this.path = [ '/series/smaga', '/series/bmaga', '/series/others' ];
        this.queryManga = 'article.serial-series-contents ul.serial-series-list > li.serial-series-item > a';
        this.queryMangaTitle = 'h4.series-title';
    }
}
