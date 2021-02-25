import CoreView from './templates/CoreView.mjs';

export default class ComicAction extends CoreView {

    constructor() {
        super();
        super.id = 'comicaction';
        super.label = 'webアクション (Comic Action)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-action.com';
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Linux; Android 9; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4026.0 Mobile Safari/537.36');
        
        this.queryManga = 'section.series ul.series-series-list > li.series-series-item';
        this.queryMangaURI = 'a';
        this.queryMangaTitle = 'h3.series-title';
    }
}
