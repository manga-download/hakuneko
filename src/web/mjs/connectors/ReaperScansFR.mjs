import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReaperScansFR extends WordPressMadara {

    constructor() {
        super();
        super.id = 'reaperscansfr';
        super.label = 'Reaper Scans (French)';
        this.tags = ['webtoon', 'french'];
        this.url = 'https://reaperscans.fr';
        this.queryChapters = 'div.chapter-link > a';
        this.queryChaptersTitleBloat ='span.chapter-release-date';
        this.links = {
            login: 'https://reaperscans.fr/login'
        };
    }
}