import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReaperScansBR extends WordPressMadara {

    constructor() {
        super();
        super.id = 'reaperscansbr';
        super.label = 'Reaper Scans BR';
        this.tags = [ 'webtoon', 'portuguese' ];
        this.url = 'https://reaperscans.com.br';
        this.queryChapters = 'div.chapter-link > a';
    }
}