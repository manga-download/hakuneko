import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Nekomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'nekomik';
        super.label = 'Nekomik';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://nekomik.me';
        this.path = '/manga/list-mode/';
    }
}
