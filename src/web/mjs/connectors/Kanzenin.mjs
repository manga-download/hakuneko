import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Kanzenin extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'kanzenin';
        super.label = 'Kanzenin';
        this.tags = ['hentai', 'indonesian'];
        this.url = 'https://kanzenin.info';
        this.path = '/manga/list-mode/';
    }
}
