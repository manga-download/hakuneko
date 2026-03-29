import HeanCms from './templates/HeanCms.mjs';

export default class PerfScan extends HeanCms {
    constructor() {
        super();
        super.id = 'perfscan';
        super.label = 'Perf Scan';
        this.tags = [ 'webtoon', 'scanlation', 'french'];
        this.url = 'https://perf-scan.fr';
        this.api = 'https://api.perf-scan.fr';
        this.links = {
            login: 'https://perf-scan.fr/login'
        };
    }
}
