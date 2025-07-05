import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Onemanga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'onemanga';
        super.label = 'One-Manga';
        this.tags = [ 'webtoon', 'thai','manga' ];
        this.url = 'https://one-manga.com/';
        this.path = '/manga/manga/list-mode/';
    }
}