import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikAV extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikav';
        super.label = 'APKomik';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://apkomik.cc';
        this.path = '/manga/list-mode/';
    }
}
