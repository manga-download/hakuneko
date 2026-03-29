import SinMH from './templates/SinMH.mjs';

export default class ManHuaNiu extends SinMH {

    constructor() {
        super();
        super.id = 'manhuaniu';
        super.label = '漫画牛 (ManHuaNiu)';
        this.tags = [ 'webtoon', 'hentai', 'chinese' ];
        this.url = 'https://www.manhuaniu.com';
        this.requestOptions.headers.set('x-referer', this.url);
        this.queryChapters = 'div.comic-chapters ul li a:not([href*="javascript"])';
    }
}