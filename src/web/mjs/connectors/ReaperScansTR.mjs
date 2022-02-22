import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReaperScansTR extends WordPressMadara {

    constructor() {
        super();
        super.id = 'reaperscanstr';
        super.label = 'Reaper Scans TR';
        this.tags = ['webtoon', 'turkish'];
        this.url = 'https://tr.reaperscans.com';
        this.queryChapters = 'div.chapter-link > a';
    }
}