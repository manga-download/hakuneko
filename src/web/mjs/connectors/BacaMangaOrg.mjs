import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class BacaMangaOrg extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'bacamangaorg';
        super.label = 'MangaTale';
        this.tags = ['manga', 'webtoon', 'indonesian'];
        this.url = 'https://mangatale.co';
        this.path = '/manga/list-mode/';
    }
}
