import SinMH from './templates/SinMH.mjs';

export default class Guoman8 extends SinMH {

    constructor() {
        super();
        super.id = 'guoman8';
        super.label = '国漫吧 (Guoman8)';
        this.tags = [ 'manga', 'chinese' ];
        this.url = 'http://www.guoman8.cc';
        this.requestOptions.headers.set('x-referer', this.url);

        this.path = '/list/p-%PAGE%';
        this.queryMangasPageCount = 'div.pager-cont span.pager a:nth-last-of-type(2)';
        this.queryChapters = 'div.chapter-list ul li a';
        this.queryPagesScript =`
            new Promise(resolve => resolve(cInfo.fs.map(img => 'http://' + pageConfig.host.auto + img)));
        `;
    }
}
