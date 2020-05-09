import Genkan from './templates/Genkan.mjs';

export default class SKScans extends Genkan {

    constructor() {
        super();
        super.id = 'skscans';
        super.label = 'SK Scans (Sleeping Knight)';
        this.tags = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://skscans.com';
    }
}