import Toomics from './templates/Toomics.mjs';

/**
 *
 */
export default class ToomicsSC extends Toomics {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'toomics-sc';
        super.label = 'Toomics (Simplified Chinese)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://global.toomics.com/sc'; // URL for copy/paste detection
        this.requestOptions.headers.set( 'x-cookie', 'content_lang=zh_cn' );

        this.path = '/sc/webtoon/ranking';
    }
}