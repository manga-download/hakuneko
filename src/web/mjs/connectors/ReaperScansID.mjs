import ReaperScans from './ReaperScans.mjs';

export default class ReaperScansFR extends ReaperScans {
    constructor() {
        super();
        super.id = 'reaperscansid';
        super.label = 'Reaper Scans (Indonesia)';
        this.tags = ['webtoon', 'indonesia'];
        this.url = 'https://reaperscans.id';
        this.links = {
            login: 'https://reaperscans.id/login'
        };
    }
}
