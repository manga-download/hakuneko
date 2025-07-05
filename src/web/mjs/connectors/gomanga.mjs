import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Gomanga extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'gomanga';
        super.label = 'Go-Manga';
        this.tags = [ 'manga', 'thai' ];
        this.url = 'https://www.go-manga.com/';
        this.path = '/manga/list-mode/';
    }
}