import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class GrazeScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'grazescans';
        super.label = 'GrazeScans';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://grazescans.com';
        this.path = '/manga/list-mode/';

        this.queryChapters = 'div#chapterlist ul li a';
    }
}