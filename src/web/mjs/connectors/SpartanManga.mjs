import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SpartanManga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'spartanmanga';
        super.label = 'SpartanManga';
        this.tags = ['manga', 'turkish'];
        this.url = 'https://spartanmanga.com.tr';
        this.path = '/manga/list-mode/';
    }
}
