import WordPressMadara from './templates/WordPressMadara.mjs';

export default class HunterScanEN extends WordPressMadara {

    constructor() {
        super();
        super.id = 'hunterscan-en';
        super.label = 'Hunters Scan (EN)';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://en.huntersscan.xyz';
    }

    get icon() {
        return '/img/connectors/hunterscan';
    }
}
