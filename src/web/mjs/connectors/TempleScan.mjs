import HeanCms from './templates/HeanCms.mjs';

export default class TempleScan extends HeanCms {
    constructor() {
        super();
        super.id = 'templescan';
        super.label = 'Temple Scan';
        this.tags = [ 'webtoon', 'scanlation', 'english' ];
        this.url = 'https://templescan.net';
        this.api = 'https://templescan.net/apiv1';
    }
}
