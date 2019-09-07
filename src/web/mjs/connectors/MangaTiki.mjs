import FlatManga from './templates/FlatManga.mjs';

export default class MangaTiki extends FlatManga {

    constructor() {
        super();
        super.id = 'mangatiki';
        super.label = 'MangaTiki';
        this.tags = [ 'manga', 'raw', 'japanese' ];
        this.url = 'https://mangatiki.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.queryChapters = 'div#tab-chapper div#list-chapters span.title a.chapter';
    }
}