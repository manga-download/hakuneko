import CoreView from './templates/CoreView.mjs';

export default class ComicZenon extends CoreView {

    constructor() {
        super();
        super.id = 'comiczenon';
        super.label = 'ゼノン編集部 (Comic Zenon)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://comic-zenon.com';

        this.path = [ '/series/zenon', '/series/zenyon', '/series/tatan', '/series/oneshot' ];
        this.queryManga = 'div.serial-contents section div.series-item h4 > a';
        this.queryMangaTitle = undefined;

    }
}