import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MonzeeKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'monzeekomik';
        super.label = 'MonzeeKomik';
        this.tags = ['manga', 'manhwa', 'indonesian'];
        this.url = 'https://monzeekomik.my.id';
        this.path = '/manga/list-mode/';
    }
}
