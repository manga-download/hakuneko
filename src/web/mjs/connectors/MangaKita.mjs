import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaKita extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangakita';
        super.label = 'MangaKita';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://mangakita.id';
        this.path = '/manga/list-mode/';
    }

    async _getPages(chapter) {
        const fakeLinkPatterns = [
            /[.,]5\.(jpg|png)$/i,
            /iklan\.(jpg|png)$/i,
            /zz\.(jpg|png)$/i,
            /\.filerun\./i
        ];
        let pageList = await super._getPages(chapter);
        return pageList.filter(link => !fakeLinkPatterns.some(pattern => pattern.test(link)));
    }
}
