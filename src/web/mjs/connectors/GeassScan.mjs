import WordPressMadara from './templates/WordPressMadara.mjs';

export default class GeassScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'geassscan';
        super.label = 'Geass Scan';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://geassscan.xyz';
    }
}