import Toomics from './templates/Toomics.mjs';

export default class ToomicsIT extends Toomics {

    constructor() {
        super();
        super.id = 'toomics-it';
        super.label = 'Toomics (Itialian)';
        this.tags = [ 'webtoon', 'italian' ];
        this.url = 'https://global.toomics.com/it'; // URL for copy/paste detection
        this.requestOptions.headers.set('x-cookie', 'content_lang=it');

        this.path = '/it/webtoon/ranking';
    }
}