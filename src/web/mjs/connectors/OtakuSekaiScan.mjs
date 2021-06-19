import WordPressMadara from './templates/WordPressMadara.mjs';

export default class OtakuSekaiScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'otakusekaiscan';
        super.label = 'OtakuSekai Scan';
        this.tags = [ 'manga', 'webtoon', 'portuguese' ];
        this.url = 'https://otkscanlator.xyz';
    }
}