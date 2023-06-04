import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SirenKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'sirenkomik';
        super.label = 'SirenKomik';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://sirenkomik.my.id';
        this.path = '/manga/list-mode/';
    }
}
