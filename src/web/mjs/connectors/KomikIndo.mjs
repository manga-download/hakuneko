import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikIndo extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komikindo';
        super.label = 'KomikIndo';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://komikindo.co';
        this.path = '/manga-list/?list';
    }
}