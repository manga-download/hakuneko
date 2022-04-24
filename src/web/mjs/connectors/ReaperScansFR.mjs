import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReaperScansFr extends WordPressMadara {

    constructor() {
        super();
        super.id = 'reaperscansfr';
        super.label = 'Reaper Scans Fr';
        this.tags = ['webtoon', 'french'];
        this.url = 'https://new.reaperscans.fr';
        this.links = {
            login: 'https://new.reaperscans.fr/login'
        };
        this.queryChapters = 'div.chapter-link > a';
        this.queryChaptersTitleBloat = 'span.chapter-release-date';
    }
}
