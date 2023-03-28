import WordPressMadara from './templates/WordPressMadara.mjs';

export default class CovenScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'covenscan';
        super.label = 'Coven Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://covenscan.com';

    }
}