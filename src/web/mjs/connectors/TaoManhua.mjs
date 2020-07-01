import MHXK from './templates/MHXK.mjs';

export default class TaoManhua extends MHXK {

    constructor() {
        super();
        super.id = 'taomanhua';
        super.label = '神漫画 (Tao Manhua)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.taomanhua.com';

        // extracted from: https://resource.mhxk.com/shenmanhua_pc/static/js/chunk/vendor.d9c425.js
        this.product = {
            id: 3,
            name: 'smh',
            platform: 'pc'
        };
    }
}