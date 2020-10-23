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
            new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error('Failed to get page links!')), 5000);
                let script = [...document.querySelectorAll('script:not([src])')].find(script => script.text.trim().startsWith('eval(function(p,a,c,k,e,d)')).text.match(/eval(\\(function\\(p,a,c,k,e,d\\)[\\s\\S]*\\{\\}\\)\\))/)[1];
                let data = ((eval(script)).match(/fs':\\[([^\\]]+)\\],/)[1]).split(',').map(data=> 'http://images.720rs.com' + data.match(/'([^']*)'/)[1])
                resolve(data);
            } );
        `;
    }
}
