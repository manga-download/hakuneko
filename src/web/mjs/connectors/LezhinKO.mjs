import Lezhin from './templates/Lezhin.mjs';

export default class LezhinKO extends Lezhin {

    constructor() {
        super();
        super.id = 'lezhin-ko';
        super.label = 'Lezhin (korean)';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://www.lezhin.com/ko';
        this.links = {
            login: this.url + '/login#email'
        };
        this.requestOptions.headers.set( 'x-cookie', 'x-lz-locale=ko_KR' );
        this.requestOptions.headers.set( 'x-lz-locale', 'ko-KR' );
        this.locale = 'ko-KR';
    }
}