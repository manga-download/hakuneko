import MHXK from './templates/MHXK.mjs';

export default class ManhuaTai extends MHXK {

    constructor() {
        super();
        super.id = 'manhuatai';
        super.label = 'ManhuaTai';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.manhuatai.com';

        this.product = {
            id: 2,
            name: 'mht',
            platform: 'pc'
        };
    }
}