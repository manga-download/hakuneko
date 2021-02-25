import CoreView from './templates/CoreView.mjs';

export default class HerosWeb extends CoreView {

    constructor() {
        super();
        super.id = 'herosweb';
        super.label = "Hero's (ヒーローズ)";
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://viewer.heros-web.com';
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Linux; Android 9; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4026.0 Mobile Safari/537.36');
        
        this.path = [ '/series/heros', '/series/flat', '/series/wild' ];
        this.queryManga = 'section.series-section ul.series-items > li.series-item > a';
        this.queryMangaTitle = 'h4.item-series-title';
    }
}
