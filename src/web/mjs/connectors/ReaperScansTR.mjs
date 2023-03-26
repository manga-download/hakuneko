import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReaperScansTR extends WordPressMadara {

    constructor() {
        super();
        super.id = 'reaperscanstr';
        super.label = 'Reaper Scans (Turkish)';
        this.tags = ['webtoon', 'turkish'];
        this.url = 'https://reaperscanstr.com';
        this.queryChapters = 'div.chapter-link > a';
        this.queryChaptersTitleBloat ='span.chapter-release-date';
        this.links = {
            login: 'https://reaperscanstr.com/login'
        };
    }
}