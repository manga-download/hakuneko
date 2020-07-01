import ZYMK from './templates/ZYMK.mjs';

export default class ManHua517 extends ZYMK {

    constructor() {
        super();
        super.id = '517mh';
        super.label = '517漫画网 (517 ManhuaWeb)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'http://www.517mh.net';

        this.path = '/sort/index_';
    }
}