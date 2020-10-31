import WordPressMadara from './templates/WordPressMadara.mjs';

export default class OffScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'offscan';
        super.label = 'OFF SCAN';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://offscan.top';
    }
}