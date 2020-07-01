import MHXK from './templates/MHXK.mjs';

export default class KaiManhua extends MHXK {

    constructor() {
        super();
        super.id = 'kaimanhua';
        super.label = '凯漫画 (Kai Manhua)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.kaimanhua.com';

        // extracted from: https://resource.mhxk.com/kaimanhua_pc/static/js/chunk/vendor.57e026.js
        this.product = {
            id: 14,
            name: 'kaimh',
            platform: 'pc'
        };
    }
}