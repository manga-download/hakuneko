import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ShojoScans extends WordPressMangastream {
    constructor() {
        super();
        super.id = 'shojoscans';
        super.label = 'ShojoScans';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://shojoscans.com';
        this.path = '/comics/list-mode/';

        this.queryChapters = 'div#chapterlist ul li a';
    }
}