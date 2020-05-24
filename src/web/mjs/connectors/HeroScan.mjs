import FlatManga from './templates/FlatManga.mjs';

export default class HeroScan extends FlatManga {

    constructor() {
        super();
        super.id = 'heroscan';
        super.label = 'HeroScan';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://heroscan.com';
        this.requestOptions.headers.set( 'x-referer', this.url );

        this.queryChapters = 'div#tab-chapper span[class^="title"] a.chapter';
    }
}