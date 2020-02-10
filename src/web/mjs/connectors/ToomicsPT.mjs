import Toomics from './templates/Toomics.mjs';

export default class ToomicsPT extends Toomics {

    constructor() {
        super();
        super.id = 'toomics-pt';
        super.label = 'Toomics (Portuguese)';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://global.toomics.com/por'; // URL for copy/paste detection
        this.requestOptions.headers.set('x-cookie', 'content_lang=pt_br');

        this.path = '/por/webtoon/ranking';
    }
}