import SinMH from './templates/SinMH.mjs';

export default class ManHuaFen extends SinMH {

    constructor() {
        super();
        super.id = 'manhuafen';
        super.label = '漫画呗 (ManHuaFen)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.manhuafen.com';

        this.queryMangasPageCount = 'div.list_head_mid ul.pagination li.last a';
        this.queryMangas = 'ul.list_con_li li span.comic_list_det h3 a';
        this.queryChapters = 'div.zj_list_con ul li a';
    }
}