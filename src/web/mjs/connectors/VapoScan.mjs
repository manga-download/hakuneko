import WordPressMadara from './templates/WordPressMadara.mjs';

export default class VapoScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'vaposcan';
        super.label = 'Vapo Scan';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://vaposcan.net';
    }
}