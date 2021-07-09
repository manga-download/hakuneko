import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ReaperScansFR extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'reaperscansfr';
        super.label = 'Reaper Scans FR';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://reaperscans.fr/';
        this.path = '/manga/list-mode/';
    }
}