import SinMH from './templates/SinMH.mjs';

export default class wuqimh extends SinMH {

    constructor() {
        super();
        super.id = 'wuqimh';
        super.label = 'wuqimh';
        this.tags = [ 'manga','hentai','chinese' ];
        this.url = 'http://www.wuqimh.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.pathMatch = '/list/p-(\\d+)';
        this.queryMangasPageCount = 'div.pager-cont span.pager a:nth-last-of-type(2)';
        this.queryChapters = 'div.chapter-list ul li a';

        this.scriptPages =`
            new Promise(resolve => resolve(cInfo.fs.map(img => 'http://' + pageConfig.host.auto + img)));   
        `;
    }
}
