import Toomics from './templates/Toomics.mjs';

/**
 *
 */
export default class ToomicsTC extends Toomics {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'toomics-tc';
        super.label = 'Toomics (Traditional Chinese)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://global.toomics.com/tc'; // URL for copy/paste detection
        this.requestOptions.headers.set( 'x-cookie', 'content_lang=zh_tw' );

        this.path = '/tc/webtoon/ranking';
    }
}