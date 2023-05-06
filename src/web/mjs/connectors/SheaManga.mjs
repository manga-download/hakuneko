import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SheaManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'sheamanga';
        super.label = 'Shea Manga';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'http://62.171.176.78/';
        this.path = '/manga/list-mode/';
    }
}
