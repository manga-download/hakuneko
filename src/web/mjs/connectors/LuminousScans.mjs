import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class LuminousScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'luminousscans';
        super.label = 'Luminous Scans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://luminouscomics.org';
        this.path = '/series/list-mode/';

        this.queryChapters = 'div#chapterlist ul li a';
    }
}
