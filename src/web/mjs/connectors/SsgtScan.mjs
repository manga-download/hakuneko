import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SsgtScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'ssgtscan';
        super.label = 'Ssgt Scan';
        this.tags = [ 'manga', 'high-quality', 'portuguese', 'scanlation' ];
        this.url = 'https://ssgtscan.com';
        this.language = 'pt';
    }
}