import ReaperScans from './ReaperScans.mjs';

export default class ReaperScansFR extends ReaperScans {
    constructor() {
        super();
        super.id = 'reaperscansfr';
        super.label = 'Reaper Scans (French)';
        this.tags = ['webtoon', 'french'];
        this.url = 'https://new.reaperscans.fr';
        this.links = {
            login: 'https://new.reaperscans.fr/login'
        };
    }
}