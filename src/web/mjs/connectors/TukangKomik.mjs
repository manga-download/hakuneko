import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class TukangKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'tukangkomik';
        super.label = 'TukangKomik';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://tukangkomik.id';
        this.path = '/manga/list-mode';
    }
}
