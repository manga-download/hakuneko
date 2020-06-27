import MHXK from './templates/MHXK.mjs';

export default class ManHua1359 extends MHXK {

    constructor() {
        super();
        super.id = '1359mh';
        super.label = '1359漫画网 (1359 ManhuaWeb)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://1359mh.com';

        this.queryMangaTitle = 'div.title-warper h1.title';
        this.product = {
            id: 0,
            name: '',
            platform: 'pc'
        };
    }
}