import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Otsugami extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'otsugami';
        super.label = 'Otsugami';
        this.tags = ['manga', 'indonesian'];
        this.url = 'https://otsugami.id';
        this.path = '/manga/list-mode/';
    }
}
