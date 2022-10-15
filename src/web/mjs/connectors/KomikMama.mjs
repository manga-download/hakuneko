import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikMama extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikmama';
        super.label = 'Komikmama';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikmama.co';
        this.path = '/manga/list-mode/';

        this.queryChapters = 'div.bxcl ul li div.eph-num a';
    }
}