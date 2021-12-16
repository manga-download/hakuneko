import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GeassScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'geassscan';
        super.label = 'Geass Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese', 'scanlation' ];
        this.url = 'https://geassscan.net/';
    }
}
