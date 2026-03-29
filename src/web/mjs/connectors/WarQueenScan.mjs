import WordPressMadara from './templates/WordPressMadara.mjs';

export default class WarQueenScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'warqueenscan';
        super.label = 'War Queen Scan';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://wqscan.com.br';
    }
}