import CoreView from './templates/CoreView.mjs';

export default class ShonenMagazine extends CoreView {

    constructor() {
        super();
        super.id = 'shonenmagazine';
        super.label = '週刊少年マガジ (Weekly Shonen Magazine)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://shonenmagazine.com';

        this.path = [ '/series/smaga', '/series/bmaga', '/series/others' ];
        this.queryManga = 'article.serial-series-contents ul.serial-series-list > li.serial-series-item > a';
        this.queryMangaTitle = 'h4.series-title';

        this.queryChaptersSkip = 'div.series-episode-list-price';
    }
}