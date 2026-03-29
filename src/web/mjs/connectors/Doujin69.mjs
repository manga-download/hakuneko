import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Doujin69 extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'doujin69';
        super.label = 'Doujin69';
        this.tags = [ 'webtoon', 'hentai', 'thai' ];
        this.url = 'https://doujin69.com';
        this.path = '/doujin/list-mode/';
    }
}