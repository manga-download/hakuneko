import SinMH from './templates/SinMH.mjs';

export default class jpm1234 extends SinMH {
    constructor() {
        super();
        super.id = 'jpm1234';
        super.label = 'jpm1234';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'http://jpm1234.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.path = '/All/0/0/0/0/0/lastpost/p/%PAGE%/';
        this.queryManga = 'div.cf div.fl div.book-title h1';
        this.queryMangasPageCount = '#last_page';
        this.queryMangas = 'ul#contList li p.ell a:not([href="//"])';
        this.queryChapters = 'div.chapter-list ul li a';
        this.queryPagesScript = `
            new Promise(resolve => resolve(cInfo.fs.map(img => 'http://' + (/\\d$/.test(img) ? pageConfig.host.auto[0].replace('uploads','') : pageConfig.host.auto) + img)));
        `;

        this.config = {
            throttle: {
                label: 'Throttle Requests [ms]',
                description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may reject to many consecuitive requests.\nChapters with lots of pages may require a longer delay',
                input: 'numeric',
                min: 0,
                max: 5000,
                value: 1000
            }
        };
    }
}