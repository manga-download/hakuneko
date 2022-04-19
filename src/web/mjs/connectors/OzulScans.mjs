import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class OzulScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'ozulscans';
        super.label = 'Ozul Scans';
        this.tags = ['webtoon', 'arabic'];
        this.url = 'https://ozulscans.com';
        this.path = '/manga/list-mode/';
    }
}