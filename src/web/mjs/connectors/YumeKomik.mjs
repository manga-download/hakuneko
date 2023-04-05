import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class YumeKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'yumekomik';
        super.label = 'YumeKomik';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://yumekomik.com';
        this.path = '/manga/list-mode/';
    }
}
