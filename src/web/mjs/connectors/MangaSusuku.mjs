import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MangaSusuku extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'mangasusuku';
        super.label = 'MangaSusuku';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://mangasusuku.xyz ';
        this.path = '/komik/list-mode/';
    }
}
