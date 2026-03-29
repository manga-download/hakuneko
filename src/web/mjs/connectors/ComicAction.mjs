import CoreView from './templates/CoreView.mjs';

export default class ComicAction extends CoreView {

    constructor() {
        super();
        super.id = 'comicaction';
        super.label = 'webアクション (Comic Action)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-action.com';

        this.queryManga = 'section.series ul.series-series-list > li.series-series-item';
        this.queryMangaURI = 'a';
        this.queryMangaTitle = 'h3.series-title';
    }
}