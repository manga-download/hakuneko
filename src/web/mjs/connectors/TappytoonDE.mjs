import Tappytoon from './templates/Tappytoon.mjs';

export default class TappytoonDE extends Tappytoon {

    constructor() {
        super();
        super.id = 'tappytoon-de';
        super.label = 'Tappytoon (German)';
        this.tags = [ 'webtoon', 'german' ];
        this.url = 'https://www.tappytoon.com/de';
        this.links = {
            login: 'https://www.tappytoon.com/de/login'
        };

        this.lang = 'de';
        this.requestOptions.headers.set('Accept-Language', this.lang);
    }
}