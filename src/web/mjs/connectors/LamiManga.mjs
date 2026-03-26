import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class LamiManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'lamimanga';
        super.label = 'Lami-Manga';
        this.tags = [ 'manga', 'webtoon', 'thai' ];
        this.url = 'https://lami-manga.com';
        this.path = '/manga/list-mode/';
    }
}