import Toomics from './templates/Toomics.mjs';

export default class ToomicsJP extends Toomics {

    constructor() {
        super();
        super.id = 'toomics-jp';
        super.label = 'Toomics (Japanese)';
        this.tags = [ 'webtoon', 'japanese' ];
        this.url = 'https://global.toomics.com/jp'; // URL for copy/paste detection
        this.requestOptions.headers.set('x-cookie', 'content_lang=jp');

        this.path = '/jp/webtoon/ranking';
    }
}