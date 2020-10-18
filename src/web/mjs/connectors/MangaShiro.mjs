import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaShiro extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangashiro';
        super.label = 'MangaShiro';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangashiro.co';
        this.path = '/manga/?list';

        this.queryChapters = 'div.bxcl ul li span.lchx a';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div#readerarea > :not(.kln) img[src]:not([src=""])';
    }

    async _getPages(chapter) {
        let pageList = await super._getPages(chapter);
        return pageList.filter(page => !page.endsWith('Last%2Bcover%2Bshironime.png'));
    }
}