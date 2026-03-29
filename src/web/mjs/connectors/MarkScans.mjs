import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MarkScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'markscans';
        super.label = 'Mark Scans';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://markscans.online';
    }
}