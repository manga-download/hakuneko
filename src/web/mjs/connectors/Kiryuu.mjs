import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Kiryuu extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'kiryuu';
        super.label = 'Kiryuu';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://kiryuu.co';
        this.path = '/manga/list-mode/';

        this.queryChapters = 'div#chapterlist ul li div.eph-num a';
        this.queryChaptersTitle = 'span.chapternum';
    }

    async _getPages(chapter) {
        let pageList = await super._getPages(chapter);
        return pageList.filter(link => {
            return !link.includes('.filerun.')
                && !link.endsWith('iklan.png')
                && !link.endsWith('.5.jpg')
                && !link.endsWith(',5.jpg')
                && !link.endsWith('ZZ.jpg');
        });
    }
}