import SixParkbbs from './templates/SixParkbbs.mjs';

export default class SixParkbbsWeb extends SixParkbbs {

    constructor() {
        super();
        super.id = 'sixparkbbsweb';
        super.label = '6parkbbs (新❀华漫)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://web.6parkbbs.com';

        this.path = '/index.php?app=forum&act=bbs&bbsid=2032&p=%PAGE%';
        this.pathMatch = /p=(\d+)/;
        this.queryMangaTitle = 'div.c-box p.c-box-h b';
        this.queryMangas = 'div#d_list div.repl-list-one a:nth-child(1)';
        this.queryMangasMatch = /.*\[漫画\]/;
        this.queryPage = 'div.cen-main div.c-box-m center source';
    }
}