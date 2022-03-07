import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class BacaMangaOrg extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'bacamangaorg';
        super.label = 'BacaMangaOrg';
        this.tags = ['manga', 'webtoon', 'indonesian'];
        this.url = 'https://bacamanga.org';
        this.path = '/manga/?list';
    }
}
