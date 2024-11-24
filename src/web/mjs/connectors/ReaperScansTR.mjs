import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ReaperScansTR extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'reaperscanstr';
        super.label = 'Reaper Scans (Turkish)';
        this.tags = ['webtoon', 'turkish'];
        this.url = 'https://reaperscans.com.tr';
        this.path = '/manga/list-mode/';
        this.links = {
            login: 'https://reaperscans.com.tr/login'
        };
    }
}
