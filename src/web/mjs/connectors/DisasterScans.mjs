import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DisasterScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'disasterscans';
        super.label = 'Disaster Scans';
        this.tags = [ 'webtoon', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://disasterscans.com';
    }
}