import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AncientEmpireScan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'ancientempirescan';
        super.label = 'Ancient Empire Scan';
        this.tags = [ 'webtoon', 'spanish' ];
        this.url = 'https://www.ancientempirescan.website';
    }
}