import CoreView from './templates/CoreView.mjs';

export default class TonariNoYoungJump extends CoreView {

    constructor() {
        super();
        super.id = 'tonarinoyoungjump';
        super.label = 'となりのヤングジャンプ (Tonari no Young Jump)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://tonarinoyj.jp';
        this.path = ['/series', '/series/oneshot', '/series/trial'];

        this.queryManga = 'div.serial-contents ul.series-table-list > li.subpage-table-list-item > a';
        this.queryMangaTitle = 'h4.title';
        this.queryPages = 'p.page-area[data-src]';
    }
}