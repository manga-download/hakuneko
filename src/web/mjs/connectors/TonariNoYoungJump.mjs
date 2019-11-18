import CoreView from './templates/CoreView.mjs';

export default class TonariNoYoungJump extends CoreView {

    constructor() {
        super();
        super.id = 'tonarinoyoungjump';
        super.label = 'となりのヤングジャンプ (Tonari no Young Jump)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://tonarinoyj.jp';

        this.queryManga = 'div.series-items ul.daily-series > li.daily-series-item > a';
        this.queryMangaTitle = 'h4.daily-series-title';
        this.queryPages = 'p.page-area[data-src]';
    }
}