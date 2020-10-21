import MH from './templates/MH.mjs';

export default class kuimh extends MH {

    constructor() {
        super();
        super.id = 'kuimh';
        super.label = '酷爱漫画 (Kuimh)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.kuimh.com';
    }
}