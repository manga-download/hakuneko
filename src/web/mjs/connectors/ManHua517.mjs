import MHXK from './templates/MHXK.mjs';

export default class ManHua517 extends MHXK {

    constructor() {
        super();
        super.id = '517mh';
        super.label = '517漫画网 (517 ManhuaWeb)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'http://www.517mh.net';

        this.queryMangaTitle = 'div.title-warper h1.title';
        this.product = {
            id: 0,
            name: '',
            platform: 'pc'
        };
    }
}