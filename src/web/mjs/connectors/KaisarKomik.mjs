import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KaisarKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'kaisarkomik';
        super.label = 'KaisarKomik';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://kaisarkomik.com';
        this.path = '/manga/?list';
    }
}