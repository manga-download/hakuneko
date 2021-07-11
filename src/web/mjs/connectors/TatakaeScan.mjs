import WordPressMadara from './templates/WordPressMadara.mjs';

export default class TatakaeScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'tatakaescan';
        super.label = 'Tatakae Scan';
        this.tags = [ 'webtoon', 'manga', 'portuguese', 'scanlation' ];
        this.url = 'https://tatakaescan.xyz';
    }
}
