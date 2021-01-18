import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class GuruKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'gurukomik';
        super.label = 'GuruKomik';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://gurukomik.com';
        this.path = '/manga/?list';
    }
}