import Toomics from './templates/Toomics.mjs';

/**
 *
 */
export default class ToomicsEN extends Toomics {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'toomics-en';
        super.label = 'Toomics (English)';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://global.toomics.com/en'; // URL for copy/paste detection
        this.requestOptions.headers.set( 'x-cookie', 'content_lang=en' );

        this.path = '/en/webtoon/ranking';
    }
}