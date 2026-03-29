import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class BacaKomikID extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'bacakomikid';
        super.label = 'BacaKomikID';
        this.tags = ['manga', 'webtoon', 'indonesian'];
        this.url = 'https://bacakomikid.com';
        this.path = '/manga/?list';
    }
}
