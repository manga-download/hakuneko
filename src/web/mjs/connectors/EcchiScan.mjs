import FlatManga from './templates/FlatManga.mjs';

export default class EcchiScan extends FlatManga {

    constructor() {
        super();
        super.id = 'ecchiscan';
        super.label = 'EcchiScan';
        this.tags = [ 'hentai', 'multi-lingual' ];
        this.url = 'https://ecchiscan.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.queryChapters = 'div#tab-chapper div#list-chapters span.title a.chapter';
    }
}