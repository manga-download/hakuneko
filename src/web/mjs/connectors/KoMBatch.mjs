import WordPressMangastream from './templates/WordPressMangastream.mjs';

// very similar to WordPressEManga
export default class KoMBatch extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'kombatch';
        super.label = 'KoMBatch';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://kombatch.cc';
        this.path = '/manga/list-mode/';
    }

}
