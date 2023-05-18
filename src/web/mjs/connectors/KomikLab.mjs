import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class KomikLab extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'komiklab';
        super.label = 'Soul Scans';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://soulscans.my.id';
        this.path = '/manga/list-mode/';
    }
}
