import CoreView from './templates/CoreView.mjs';

export default class ComicGardo extends CoreView {

    constructor() {
        super();
        super.id = 'comicgardo';
        super.label = 'コミックガルド (Comic Gardo)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-gardo.com';
        this.requestOptions.headers.set('x-user-agent', 'Mozilla/5.0 (Linux; Android 9; Pixel) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4026.0 Mobile Safari/537.36');
        
        this.path = [ '/series' ];
        this.queryManga = 'div.series ul.series-section-list li.series-section-item a.series-section-item-link';
        this.queryMangaTitle = 'h5.series-title';
    }
}
