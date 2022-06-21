import WordPressMadara from './templates/WordPressMadara.mjs';

export default class SugarBBScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'sugarbbscan';
        super.label = 'Sugar Babies Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://sugarbbscan.com';
    }
}