import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class LELManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'lelmanga';
        super.label = 'LELManga';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://www.lelmanga.com';
        this.path = '/manga/list-mode/';
    }
}
