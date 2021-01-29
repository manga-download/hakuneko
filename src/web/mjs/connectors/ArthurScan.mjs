import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ArthurScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'arthurscan';
        super.label = 'Arthur Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://arthurscan.xyz';
    }
}