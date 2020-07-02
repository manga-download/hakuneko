import ZYMK from './templates/ZYMK.mjs';

export default class ManHua1359 extends ZYMK {

    constructor() {
        super();
        super.id = '1359mh';
        super.label = '1359漫画网 (1359 ManhuaWeb)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://1359mh.com';

        this.path = '/sort/';
    }
}