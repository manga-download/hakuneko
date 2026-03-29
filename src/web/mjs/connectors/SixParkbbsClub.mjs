import SixParkbbs from './templates/SixParkbbs.mjs';

export default class SixParkbbsClub extends SixParkbbs {

    constructor() {
        super();
        super.id = 'sixparkbbsclub';
        super.label = '6parkbbs (卡通漫画)';
        this.tags = [ 'manga', 'webtoon', 'chinese', 'english', 'korean', 'raw' ];
        this.url = 'https://club.6parkbbs.com';
        this.sub = '/enter6';

        this.path = '/index.php?app=forum&act=list&pre=55764&nowpage=%PAGE%&start=55764';
        this.pathMatch = /nowpage=(\d+)&start/;
        this.queryMangaTitle = 'td.show_content font b';
        this.queryMangas = 'div#d_list ul li a:nth-child(1)';
        this.queryMangasMatch = /(【(连载|英肉|短篇|生肉|韩肉)】.*)|(\[连载\].*)/;
        this.queryPage = 'td.show_content pre source';
    }
}