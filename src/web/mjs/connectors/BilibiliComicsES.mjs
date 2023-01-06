import BilibiliManhua from './BilibiliManhua.mjs';

export default class BilibiliComicsES extends BilibiliManhua {

    constructor() {
        super();
        super.id = 'bilibili-comics-es';
        super.label = 'Bilibili Comics (Spanish)';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://www.bilibilicomics.com';
        this.lang = 'es';
        this.links = {
            login: 'https://www.bilibilicomics.com/account'
        };
    }

    get icon() {
        return '/img/connectors/bilibili-comics';
    }
}
