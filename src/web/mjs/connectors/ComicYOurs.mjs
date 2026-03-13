import CoreView from './templates/CoreView.mjs';

export default class ComicYOurs extends CoreView {

    constructor() {
        super();
        super.id = 'comicyours';
        super.label = 'Comic Y-Ours';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://comic-y-ours.com';
        this.path = ['/series', '/series/oneshot', '/comics'];

        this.queryManga = 'a.SeriesPageItem_itemLink__CwdMa';
        this.queryMangaTitle = 'span.SeriesPageItem_title___DXCC';
        this.queryPages = 'p.page-area[data-src]';
    }
}