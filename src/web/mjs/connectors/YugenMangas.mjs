import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class YugenMangas extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'yugenmangas';
        super.label = 'YugenMangas';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://yugenmangas.com';
        this.path = '/manga/list-mode/';
    }
}