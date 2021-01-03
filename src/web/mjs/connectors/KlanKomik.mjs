import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KlanKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'klankomik';
        super.label = 'KlanKomik';
        this.tags = [ 'webtoon', 'indonesian' ];
        this.url = 'https://klankomik.com';
        this.path = '/manga/list-mode/';
    }

}