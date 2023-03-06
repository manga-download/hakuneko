import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ManhwaFreak extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'manhwafreak';
        super.label = 'ManhwaFreak';
        this.tags = [ 'manga', 'english', 'webtoon'];
        this.url = 'https://manhwafreak.com';
        this.path = '/manga/';
        this.queryMangas = 'div.lastest-serie > a';
        this.queryChapters = 'div.chapter-li > a';
        this.queryChaptersTitle = 'div.chapter-info > p';
    }
}