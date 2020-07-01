import MHXK from './templates/MHXK.mjs';

export default class SouDongMan extends MHXK {

    constructor() {
        super();
        super.id = 'soudongman';
        super.label = '斗罗大陆 (SouDongMan)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.soudongman.com';

        this.queryMangaTitle = 'div.title-warper h1.title';
        // extracted from: https://resource.mhxk.com/soudongman_pc/static/js/chunk/vendor.23b7d6.js
        this.product = {
            id: 9,
            name: 'soudm',
            platform: 'pc'
        };
    }
}