import BilibiliManhua from './BilibiliManhua.mjs';

export default class BilibiliComicsFR extends BilibiliManhua {

    constructor() {
        super();
        super.id = 'bilibili-comics-fr';
        super.label = 'Bilibili Comics (French)';
        this.tags = [ 'webtoon', 'french' ];
        this.url = 'https://www.bilibilicomics.com';
        this.lang = 'fr';
    }
    get icon() {
        return '/img/connectors/bilibili-comics';
    }
}
