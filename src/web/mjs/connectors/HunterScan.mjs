import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HunterScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hunterscan';
        super.label = 'Hunters Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://htoons.online';
    }
}
