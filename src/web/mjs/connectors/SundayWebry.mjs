import CoreView from './templates/CoreView.mjs';

export default class SundayWebry extends CoreView {

    constructor() {
        super();
        super.id = 'sundaywebry';
        super.label = 'サンデーうぇぶり (Sunday Webry)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://www.sunday-webry.com';
        this.path = ['/series', '/series/oneshot', '/series/yoru-sunday'];

        this.queryManga = 'ul.webry-series-list > li.webry-series-item > a';
        this.queryMangaTitle = 'h4.series-title';
        this.queryPages = 'p.page-area[data-src]';
    }
}