import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class WarungKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'warungkomik';
        super.label = 'WarungKomik';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://warungkomik.com';
        this.path = '/manga/list-mode/';
    }
}
