import ReaperScans from './ReaperScans.mjs';

export default class ReaperScansFR extends ReaperScans {
    constructor() {
        super();
        super.id = 'reaperscansfr';
        super.label = 'Reaper Scans (French)';
        this.tags = ['webtoon', 'french'];
        this.url = 'https://reaperscans.fr';
        this.links = {
            login: 'https://reaperscans.fr/login'
        };
    }
}
