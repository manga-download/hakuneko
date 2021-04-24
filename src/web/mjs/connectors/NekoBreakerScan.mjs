import WordPressMadara from './templates/WordPressMadara.mjs';

export default class NekoBreakerScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'nekobreakerscan';
        super.label = 'NekoBreaker Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://nekobreakerscan.com';
    }
}