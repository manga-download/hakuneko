import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ShadowMangas extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'shadowmangas';
        super.label = 'ShadowMangas';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://shadowmangas.com';
        this.path = '/manga/list-mode/';
    }
}