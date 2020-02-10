import Toomics from './templates/Toomics.mjs';

export default class ToomicsFR extends Toomics {

    constructor() {
        super();
        super.id = 'toomics-fr';
        super.label = 'Toomics (French)';
        this.tags = [ 'webtoon', 'french' ];
        this.url = 'https://global.toomics.com/fr'; // URL for copy/paste detection
        this.requestOptions.headers.set('x-cookie', 'content_lang=fr');

        this.path = '/fr/webtoon/ranking';
    }
}