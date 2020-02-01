import WordPressEManga from './templates/WordPressEManga.mjs';

export default class MangaShiro extends WordPressEManga {

    constructor() {
        super();
        super.id = 'mangashiro';
        super.label = 'MangaShiro';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangashiro.co';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
        this.queryPages = 'div#readerarea > :not(.kln) source[src]:not([src=""])';
    }

    async _getPages(chapter) {
        let pageList = await super._getPages(chapter);
        return pageList.filter(page => !page.endsWith('Last%2Bcover%2Bshironime.png'));
    }
}