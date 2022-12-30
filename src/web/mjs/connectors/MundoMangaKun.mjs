import WordPressMangastream from './templates/WordPressMangastream.mjs';
export default class MundoMangaKun extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mundomangakun';
        super.label = 'Mundo Mangá-Kun';
        this.tags = [ 'manga', 'portuguese'];
        this.url = 'https://mundomangakun.com.br';
        this.path = '/manga/list-mode/';
    }
}
