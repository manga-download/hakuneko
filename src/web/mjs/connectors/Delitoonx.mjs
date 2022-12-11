import Delitoon from './Delitoon.mjs';

export default class Delitoonx extends Delitoon {
    constructor() {
        super();
        super.id = 'delitoonx';
        super.label = 'Delitoon X';
        this.tags = [ 'webtoon', 'french', 'hentai' ];
        this.url = 'https://www.delitoonx.com';
        this.links = {
            login: 'https://www.delitoonx.com/user/login'
        };
        this.requestOptions.headers.set('x-balcony-id', 'DELITOONX_COM');
        this.requestOptions.headers.set('x-referer', this.url);
    }
    get icon() {
        return '/img/connectors/delitoon';
    }
}