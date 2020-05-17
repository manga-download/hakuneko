import MHXK from './templates/MHXK.mjs';

export default class TaoManhua extends MHXK {

    constructor() {
        super();
        super.id = 'taomanhua';
        super.label = '神漫画 (Tao Manhua)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.taomanhua.com';

        this.product = {
            id: 3,
            name: 'smh',
            platform: 'pc'
        };
    }
}