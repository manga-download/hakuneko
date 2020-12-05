import FlatManga from './templates/FlatManga.mjs';

export default class BatoScan extends FlatManga {

    constructor() {
        super();
        super.id = 'batoscan';
        super.label = 'BatoScan';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://batoscan.net';
        this.requestOptions.headers.set('x-referer', this.url + '/read-');

        this.queryChapters = 'div#tab-chapper div#list-chapters span.title a.chapter';
    }
}