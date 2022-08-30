import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Mangacim extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangacim';
        super.label = 'Mangacim';
        this.tags = [ 'manga', 'webtoon', 'turkish' ];
        this.url = 'https://www.mangacim.com';
        this.path = '/manga/list-mode/';
    }
}