import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class PatateScan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'patatescan';
        super.label = 'Patatescan';
        this.tags = [ 'manga', 'webtoon', 'french' ];
        this.url = 'https://patatescan.com';
        this.path = '/manga/list-mode/';
    }
}