import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class DuniaKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'duniakomik';
        super.label = 'Dunia Komik';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://duniakomik.org';
        this.path = '/manga/list-mode/';
    }
}
