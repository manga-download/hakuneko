import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DiabolickScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'diabolickscan';
        super.label = 'Diabolick Scan';
        this.tags = [ 'webtoon', 'manga', 'portuguese', 'scanlation' ];
        this.url = 'https://diabolickscan.com';
    }
}
