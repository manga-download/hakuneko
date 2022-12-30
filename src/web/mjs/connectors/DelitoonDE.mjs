import Delitoon from './Delitoon.mjs';

export default class DelitoonDE extends Delitoon {

    constructor() {
        super();
        super.id = 'delitoonde';
        super.label = 'Delitoon (German)';
        this.tags = [ 'webtoon', 'german' ];
        this.url = 'https://www.delitoon.de';
        this.links = {
            login: 'https://www.delitoon.de/user/login'
        };
        this.requestOptions.headers.set('x-balcony-id', 'DELITOON_DE');
        this.requestOptions.headers.set('x-referer', this.url);
    }
}