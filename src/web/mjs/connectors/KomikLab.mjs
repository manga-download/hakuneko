import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikLab extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komiklab';
        super.label = 'KomikLab (English)';
        this.tags = ['manga', 'english'];
        this.url = 'https://komiklab.com';
        this.path = '/manga/list-mode/';
    }
}
