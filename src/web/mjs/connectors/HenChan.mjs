import MangaChan from './MangaChan.mjs';

export default class HenChan extends MangaChan {

    constructor() {
        super();
        super.id = 'henchan';
        super.label = 'Хентай-тян! (Hentai-chan)';
        this.tags = [ 'hentai', 'russian' ];
        this.url = 'https://henchan.pro';

        this.path = '/manga/new';
        this.queryChapters = 'div.extaraNavi p.extra_off:last-of-type a';
    }
}