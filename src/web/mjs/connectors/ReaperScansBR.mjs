import ReaperScans from './ReaperScans.mjs';

export default class ReaperScansBR extends ReaperScans {

    constructor() {
        super();
        super.id = 'reaperscansbr';
        super.label = 'Reaper Scans (Portuguese)';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://reaperscans.com.br';
        this.links = {
            login: 'https://reaperscans.com.br/login'
        };
    }
}