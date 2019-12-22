import SinMH from './templates/SinMH.mjs';

export default class ManHuaNiu extends SinMH {

    constructor() {
        super();
        super.id = 'manhuaniu';
        super.label = '漫画牛 (ManHuaNiu)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.manhuaniu.com';
    }
}