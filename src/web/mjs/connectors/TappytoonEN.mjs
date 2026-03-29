import Tappytoon from './templates/Tappytoon.mjs';

export default class TappytoonEN extends Tappytoon {

    constructor() {
        super();
        super.id = 'tappytoon-en';
        super.label = 'Tappytoon (English)';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.tappytoon.com/en';
        this.links = {
            login: 'https://www.tappytoon.com/en/login'
        };

        this.lang = 'en';
        this.requestOptions.headers.set('Accept-Language', this.lang);
    }
}