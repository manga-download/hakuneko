import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SushiScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'sushiscans';
        super.label = 'Sushi Scans';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://sushi-scan.su';
        this.path = '/manga/list-mode/';
    }
}