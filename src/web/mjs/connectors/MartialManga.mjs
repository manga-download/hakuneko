import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MartialManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'martialmanga';
        super.label = 'MartialManga';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://martialmanga.com';
        this.path = '/manga/list-mode/';
    }
}