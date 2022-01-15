import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class FranxxMangas extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'franxxmangas';
        super.label = 'Franxx Mangas';
        this.tags = [ 'manga', 'high-quality', 'portuguese', 'scanlation' ];
        this.url = 'https://franxxmangas.net';
        this.path = '/manga/list-mode/';
    }
}