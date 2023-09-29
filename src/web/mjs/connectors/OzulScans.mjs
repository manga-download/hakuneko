import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class OzulScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'ozulscans';
        super.label = 'Ozul Scans';
        this.tags = ['webtoon', 'arabic', 'scanlation'];
        this.url = 'https://ozulscans.net';
        this.path = '/manga/list-mode/';
    }
}