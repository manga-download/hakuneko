import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Piscans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'piscans';
        super.label = 'Piscans';
        this.tags = ['manga', 'indonesian', 'scanlation'];
        this.url = 'https://piscans.in';
        this.path = '/manga/list-mode/';
    }
}
