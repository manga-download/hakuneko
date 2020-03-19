import FlatManga from './templates/FlatManga.mjs';

export default class ManhuaScan extends FlatManga {

    constructor() {
        super();
        super.id = 'manhuascan';
        super.label = 'ManhuaScan';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'multi-lingual' ];
        this.url = 'https://manhuascan.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.queryChapters = 'div#tab-chapper div#list-chapters span.title a.chapter';
    }
}