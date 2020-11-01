import SinMH from './templates/SinMH.mjs';

export default class Dmzj extends SinMH {

    constructor() {
        super();
        super.id = 'dmzj';
        super.label = '动漫之家(DMZJ)';
        this.tags = [ 'manga', 'chinese', 'webtoon' ];
        this.url = 'https://www.dmzj.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.queryChapters = 'div.tab-content-selected ul li a';
        this.queryManga = 'div.comic_deCon > h1';
        this.path = '/category/0-0-0-0-0-0-%PAGE%.html';
        this.queryMangasPageCount = 'a.pg_last';
        this.queryMangas = 'h3 > a';

        this.queryPagesScript =`
            new Promise(resolve => {
                resolve(picArry.map(el => new URL(el,img_prefix).href));
            });
        `;
    }
}