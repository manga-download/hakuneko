import MHXK from './templates/MHXK.mjs';

export default class ManhuaTai extends MHXK {

    constructor() {
        super();
        super.id = 'manhuatai';
        super.label = 'ManhuaTai';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.manhuatai.com';

        // extracted from: https://resource.mhxk.com/manhuatai_pc/static/js/chunk/vendor.a06c71.js
        this.product = {
            id: 2,
            name: 'mht',
            platform: 'pc'
        };
    }
}