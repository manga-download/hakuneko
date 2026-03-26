import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikIndo extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikindo';
        super.label = 'KomikIndo';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komiksin.id';
        this.path = '/manga/list-mode/';
    }
}
