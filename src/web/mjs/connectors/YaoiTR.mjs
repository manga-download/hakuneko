import WordPressMadara from './templates/WordPressMadara.mjs';

export default class YaoiTR extends WordPressMadara {

    constructor() {
        super();
        super.id = 'yaoitr';
        super.label = 'YaoiTR';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://yaoi-tr.com';
    }
}