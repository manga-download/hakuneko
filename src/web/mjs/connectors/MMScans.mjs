import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MMScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mmscans';
        super.label = 'MMSCANS';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mm-scans.org';
    }
}