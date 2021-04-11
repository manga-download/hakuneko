import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SekaiKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'sekaikomik';
        super.label = 'SekaiKomik';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://www.sekaikomik.club';
        this.path = '/daftar-komik/?list';
    }
}