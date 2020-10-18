import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SheaManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'sheamanga';
        super.label = 'Shea Manga';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://sheamanga.my.id';
        this.path = '/manga/list-mode/';
    }
}