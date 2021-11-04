import WordPressMadara from './templates/WordPressMadara.mjs';
import BilibiliComics from './BilibiliComics.mjs';

export default class ResetScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'resetscans';
        super.label = 'Reset Scans';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://reset-scans.com';

        this.bilibili = new BilibiliComics();
        this.queryChapters = 'li.wp-manga-chapter span.chapter-name-before a:last-of-type';
    }

    async _getPages(chapter) {
        if(chapter.id.startsWith(this.bilibili.url)) {
            const bilibiliChapter = { id: new URL(chapter.id).pathname.split('/').pop() };
            return this.bilibili._getPages(bilibiliChapter);
        } else {
            return super._getPages(chapter);
        }
    }
}