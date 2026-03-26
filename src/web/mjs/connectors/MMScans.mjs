import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MMScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mmscans';
        super.label = 'MMSCANS';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://mm-scans.org';
        this.queryMangas = 'div.item-summary a';
        this.queryPlaceholder = '[id^="manga-chapters-holder"]';
        this.queryChapters = 'li.chapter-li > a';
        this.queryChaptersTitleBloat = 'span.chapter-release-date';
    }
}
