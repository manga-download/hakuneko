import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaSusuReborn extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangasusureborn';
        super.label = 'MangaSusu Reborn';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://mangasusu.vip';
        this.path = '/manga/list-mode/';

        this.queryChapters = 'div#chapterlist ul li div.eph-num a';
        this.queryChaptersTitle = 'span.chapternum';
    }
}