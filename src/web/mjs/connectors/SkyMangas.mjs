import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SkyMangas extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'skymangas';
        super.label = 'Sky Mangas';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://skymangas.com';
        this.path = '/manga/list-mode/';
    }
}