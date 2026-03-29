import Toomics from './templates/Toomics.mjs';

export default class ToomicsDE extends Toomics {

    constructor() {
        super();
        super.id = 'toomics-de';
        super.label = 'Toomics (German)';
        this.tags = [ 'webtoon', 'german' ];
        this.url = 'https://global.toomics.com/de'; // URL for copy/paste detection
        this.requestOptions.headers.set('x-cookie', 'content_lang=de');

        this.path = '/de/webtoon/ranking';
    }
}