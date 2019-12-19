import CoreView from './templates/CoreView.mjs';

export default class ComicGardo extends CoreView {

    constructor() {
        super();
        super.id = 'comicgardo';
        super.label = 'コミックガルド (Comic Gardo)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-gardo.com';

        this.path = [ '/series' ];
        this.queryManga = 'div.series ul.series-section-list li.series-section-item a.series-section-item-link';
        this.queryMangaTitle = 'h5.series-title';
    }
}