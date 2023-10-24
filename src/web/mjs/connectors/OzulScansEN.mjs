import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class OzulScansEN extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'ozulscans-en';
        super.label = 'Ozul Scans (EN)';
        this.tags = ['webtoon', 'english', 'scanlation'];
        this.url = 'https://ozulscansen.com';
        this.path = '/comics/list-mode/';
    }
}