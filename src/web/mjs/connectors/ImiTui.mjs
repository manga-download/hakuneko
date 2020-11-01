import SinMH from './templates/SinMH.mjs';

export default class ImiTui extends SinMH {

    constructor() {
        super();
        super.id = 'imitui';
        super.label = '米推漫画 (ImiTui)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://www.imitui.com';
    }
}