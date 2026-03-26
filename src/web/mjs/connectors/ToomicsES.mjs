import Toomics from './templates/Toomics.mjs';

export default class ToomicsES extends Toomics {

    constructor() {
        super();
        super.id = 'toomics-es';
        super.label = 'Toomics (Spanish)';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://global.toomics.com/es'; // URL for copy/paste detection
        this.requestOptions.headers.set('x-cookie', 'content_lang=es_es');

        this.path = '/es/webtoon/ranking';
    }
}