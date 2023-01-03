import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReaperScansID extends WordPressMadara {
    constructor() {
        super();
        super.id = 'reaperscansid';
        super.label = 'Reaper Scans (Indonesia)';
        this.tags = ['webtoon', 'indonesia', 'scanlation'];
        this.url = 'https://reaperscans.id';
        this.queryChapters = 'div.chapter-link > a';
        this.queryChaptersTitleBloat ='span.chapter-release-date';

        this.links = {
            login: 'https://reaperscans.id/login'
        };
    }
    get icon() {
        return '/img/connectors/reaperscans';
    }
}