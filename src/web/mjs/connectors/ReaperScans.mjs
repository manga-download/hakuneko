import WordPressMadara from './templates/WordPressMadara.mjs';

export default class ReaperScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'reaperscans';
        super.label = 'Reaper Scans';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://reaperscans.com';
        this.links = {
            login: 'https://reaperscans.com/login'
        };
        this.queryChapters = 'div.chapter-link > a';
        this.queryChaptersTitleBloat = 'span.chapter-release-date';
    }

}