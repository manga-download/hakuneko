import FlatManga from './templates/FlatManga.mjs';

export default class ManhwaSmut extends FlatManga {

    constructor() {
        super();
        super.id = 'manhwasmut';
        super.label = 'ManhwaSmut';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://manhwasmut.com';

        this.queryChapters = 'div#tab-chapper div#list-chapters span.title a.chapter';
    }
}