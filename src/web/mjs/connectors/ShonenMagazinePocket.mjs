import CoreView from './templates/CoreView.mjs';

export default class ShonenMagazinePocket extends CoreView {

    constructor() {
        super();
        super.id = 'shonenmagazine-pocket';
        super.label = 'マガジンポケット (Shonen Magazine Pocket)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://pocket.shonenmagazine.com';

        this.path = [ '/series' ];
        this.queryManga = 'div.series-items ul.daily-series > li.daily-series-item > a';
        this.queryMangaTitle = 'h4.daily-series-title';

        this.queryChaptersSkip = 'div.series-episode-list-price';
    }
}