import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ToomTam extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'toomtam';
        super.label = 'ToomTam';
        this.tags = [ 'manga', 'thai' ];
        this.url = 'https://toomtam-manga.com';
        this.path = '/manga/list-mode/';
    }
}