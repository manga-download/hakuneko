import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class LuminousScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'luminousscans';
        super.label = 'Luminous Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://luminous-scans.com';
        this.path = '/series/list-mode/';

        this.queryChapters = 'div#chapterlist ul li a';
    }

    async _getPages(chapter) {
        return (await super._getPages(chapter)).filter(image => !/\/NovelBanner[^.]+\.(png|jpeg|jpg|gif)$/i.test(image));
    }
}
