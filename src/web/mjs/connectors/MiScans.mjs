import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class MiScans extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'miscans';
        super.label = 'MiScans';
        this.tags = ['manga', 'indonesian', 'scanlation'];
        this.url = 'https://miscans.my.id';
        this.path = '/manga/list-mode/';
    }
}
