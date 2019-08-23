import Lezhin from './templates/Lezhin.mjs';

/**
 *
 */
export default class LezhinEN extends Lezhin {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'lezhin-en';
        super.label = 'Lezhin (english)';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.lezhin.com/en';
        this.requestOptions.headers.set( 'x-cookie', 'x-lz-locale=en_US' );
        this.requestOptions.headers.set( 'x-lz-locale', 'en_US' );
        this.locale = 'en-US';
    }
}