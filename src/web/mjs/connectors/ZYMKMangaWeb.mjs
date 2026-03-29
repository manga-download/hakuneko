import ZYMK from './templates/ZYMK.mjs';

export default class ZYMKMangaWeb extends ZYMK {

    constructor() {
        super();
        super.id = 'zymk';
        super.label = '知音漫客网 (ZYMK MangaWeb)';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.zymk.cn';

        this.path = '/sort/index_p';
        this.queryMangasPageCount = 'div.pages a:nth-last-of-type(2)';
    }
}