import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Mgkomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mgkomik';
        super.label = 'MGKOMIK';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://mgkomik.my.id';
        this.path = '/komik/list-mode/';
    }
}