import CoreView from './templates/CoreView.mjs';

export default class HerosWeb extends CoreView {

    constructor() {
        super();
        super.id = 'herosweb';
        super.label = "Hero's (ヒーローズ)";
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://viewer.heros-web.com';

        this.path = [ '/series/heros', '/series/flat', '/series/wild' ];
        this.queryManga = 'section.series-section ul.series-items > li.series-item > a';
        this.queryMangaTitle = 'h4.item-series-title';
    }
}