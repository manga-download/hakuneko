import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SpeedManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'speedmanga';
        super.label = 'Speed-Manga';
        this.tags = [ 'manga', 'thai' ];
        this.url = 'https://speed-manga.com';
        this.path = '/manga/list-mode/';
    }
}