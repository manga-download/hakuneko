import Toomics from './templates/Toomics.mjs';

export default class ToomicsMX extends Toomics {

    constructor() {
        super();
        super.id = 'toomics-mx';
        super.label = 'Toomics (Spanish MX)';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://global.toomics.com/mx'; // URL for copy/paste detection
        this.requestOptions.headers.set('x-cookie', 'content_lang=es_mx');

        this.path = '/mx/webtoon/ranking';
    }
}