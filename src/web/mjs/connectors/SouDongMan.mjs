import MHXK from './templates/MHXK.mjs';

export default class SouDongMan extends MHXK {

    constructor() {
        super();
        super.id = 'soudongman';
        super.label = '斗罗大陆 (SouDongMan)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.soudongman.com';

        this.queryMangaTitle = 'div.title-warper h1.title';
        this.product = {
            id: 9,
            name: 'soudm',
            platform: 'pc'
        };
    }
}