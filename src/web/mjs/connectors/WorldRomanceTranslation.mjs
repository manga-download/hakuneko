import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class WorldRomanceTranslation extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'worldromancetranslation';
        super.label = 'World Romance Translation';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://wrt.my.id';
        this.path = '/manga/list-mode/';

        this.queryChapters = 'div#chapterlist ul li div.eph-num a:last-of-type';
    }
}