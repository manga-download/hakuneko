import SinMH from './templates/SinMH.mjs';

export default class GuFengMH8 extends SinMH {

    constructor() {
        super();
        super.id = 'gufengmh8';
        super.label = '古风漫画网 (GuFengMH8)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.gufengmh8.com';
    }
}