import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Futari extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'futari';
        super.label = 'Futari';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://futari.info';
        this.path = '/manga/list-mode/';
    }
}
