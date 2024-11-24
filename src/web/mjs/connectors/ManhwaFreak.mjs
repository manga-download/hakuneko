import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ManhwaFreak extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manhwafreak';
        super.label = 'ManhwaFreak';
        this.tags = [ 'manga', 'english', 'webtoon'];
        this.url = 'https://manhwa-freak.org';
        this.path = '/manga/';
        this.queryMangas = 'div.lastest-serie > a';
        this.queryChapters = 'div.chapter-li > a';
        this.queryChaptersTitle = 'div.chapter-info > p';
    }

    async _getPages(chapter) {
        return (await super._getPages(chapter))
            .filter(page => !page.includes('ajax-loader') && !page.endsWith('/100.5.gif'));
    }
}
