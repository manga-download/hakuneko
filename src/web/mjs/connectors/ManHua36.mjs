import SinMH from './templates/SinMH.mjs';

export default class ManHua36 extends SinMH {

    constructor() {
        super();
        super.id = '36manhua';
        super.label = '36漫画网 (36ManHua)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.36mh.net';
    }
}