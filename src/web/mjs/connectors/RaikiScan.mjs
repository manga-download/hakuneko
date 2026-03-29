import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class RaikiScan extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'raikiscan';
        super.label = 'Raiki Scan';
        this.tags = [ 'manga', 'webtoon', 'spanish' ];
        this.url = 'https://raikiscan.com';
        this.path = '/manga/list-mode/';
    }
}