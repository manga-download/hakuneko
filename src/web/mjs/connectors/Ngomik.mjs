import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Ngomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'ngomik';
        super.label = 'Ngomik';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://ngomik.in';
        this.path = '/daftar-komik/?list';

        this.queryChapters = 'div.bxcl ul li div.lch a';
    }
}