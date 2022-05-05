import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Mangkomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangkomik';
        super.label = 'Mangkomik';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://mangkomik.com';
        this.path = '/manga/list-mode/';
    }
}