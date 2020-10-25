import SinMH from './templates/SinMH.mjs';

export default class SixMH7 extends SinMH {

    constructor() {
        super();
        super.id = '6mh7';
        super.label = '6漫画 (6mh7)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'http://www.6mh7.com';

        this.path = '/sort/1-%PAGE%.html';
        this.queryManga = 'div.cy_main div.cy_info div.cy_title h1';
        this.queryMangasPageCount = 'div.NewPages ul li:last-of-type a';
        this.queryMangas = 'div.cy_list_mh ul li.title a';
        this.queryChapters = 'ul[id^="mh-chapter-list"] li a';
        this.queryPagesScript = `
            new Promise(resolve => resolve(newImgs));
        `;
    }
}