import ReaperScans from './ReaperScans.mjs';

export default class ReaperScansTR extends ReaperScans {

    constructor() {
        super();
        super.id = 'reaperscanstr';
        super.label = 'Reaper Scans (Turkish)';
        this.tags = ['webtoon', 'turkish'];
        this.url = 'https://reaperscanstr.com';
        this.links = {
            login: 'https://reaperscanstr.com/login'
        };
    }
}