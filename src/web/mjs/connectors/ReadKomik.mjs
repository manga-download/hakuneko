import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ReadKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'readkomik';
        super.label = 'ReadKomik';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://www.readkomik.com';
        this.path = '/manga/list-mode/';
    }
}