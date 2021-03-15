import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Ikifang extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'ikifang';
        super.label = 'Ikifang';
        this.tags = [ 'manga', 'webtoon', 'hentai', 'spanish' ];
        this.url = 'https://ikimei.com';
        this.path = '/manga/list-mode/';
    }
}