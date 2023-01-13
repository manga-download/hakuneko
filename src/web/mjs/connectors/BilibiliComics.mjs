import BilibiliManhua from './BilibiliManhua.mjs';

export default class BilibiliComics extends BilibiliManhua {

    constructor() {
        super();
        super.id = 'bilibili-comics';
        super.label = 'Bilibili Comics (English)';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.bilibilicomics.com';
        this.lang = 'en';
    }
}