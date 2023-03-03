import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SheaKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'sheakomik';
        super.label = 'SheaKomik';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://sheakomik.com';
        this.path = '/manga/list-mode/';
    }
}
