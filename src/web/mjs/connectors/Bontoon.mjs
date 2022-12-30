import Delitoon from './Delitoon.mjs';

export default class Bontoon extends Delitoon {
    constructor() {
        super();
        super.id = 'bontoon';
        super.label = 'Bontoon';
        this.tags = [ 'webtoon', 'french', 'hentai', 'yaoi' ];
        this.url = 'https://www.bontoon.com';
        this.links = {
            login: 'https://www.bontoon.com/user/login'
        };
        this.requestOptions.headers.set('x-balcony-id', 'BONTOON_COM');
        this.requestOptions.headers.set('x-referer', this.url);
    }
    get icon() {
        return '/img/connectors/delitoon';
    }
}