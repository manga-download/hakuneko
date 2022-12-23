import BilibiliManhua from './BilibiliManhua.mjs';

export default class BilibiliComicsID extends BilibiliManhua {

    constructor() {
        super();
        super.id = 'bilibili-comics-id';
        super.label = 'Bilibili Comics (Indonesian)';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://www.bilibilicomics.com';
        this.lang = 'id';
    }
    get icon() {
        return '/img/connectors/bilibili-comics';
    }
}
