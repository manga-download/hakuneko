import SinMH from './templates/SinMH.mjs';

export default class Shoumanhua extends SinMH {

    constructor() {
        super();
        super.id = 'shoumanhua';
        super.label = '受漫画 (Shoumanhua)';
        this.tags = [ 'manga', 'chinese', 'webtoon' ];
        this.url = 'http://www.shoumanhua.com';
        this.requestOptions.headers.set('x-referer', this.url);

        this.queryChapters = '#mh-chapter-list-ol-0 a';
        this.queryManga = 'div.book-cont div.book-detail div.book-title h1';
        this.path = '/all/%PAGE%.html';
        this.queryMangasPageCount = 'div.NewPages li:last-child > a';
        this.queryMangas = 'div.cy_list_mh ul li.title a';

        this.queryPagesScript =`
            new Promise(resolve => {
                resolve(qTcms_S_m_murl.split('$qingtiandy$'));
            });
        `;
    }
}